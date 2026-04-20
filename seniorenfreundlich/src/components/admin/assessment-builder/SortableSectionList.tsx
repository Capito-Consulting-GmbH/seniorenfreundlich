"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import type { AssessmentSection, Question } from "@/src/validators/assessment";
import type { Action } from "./types";
import { SortableQuestionList } from "./SortableQuestionList";
import { SectionHeader } from "./SectionHeader";
import { QuestionTypePicker } from "./QuestionTypePicker";
import { QuestionEditorSheet } from "./QuestionEditorSheet";
import { Button } from "@/src/components/ui/button";
import { PlusCircle } from "lucide-react";

interface Props {
  sections: AssessmentSection[];
  dispatch: React.Dispatch<Action>;
  disabled?: boolean;
  lang: "de" | "en";
}

export function SortableSectionList({ sections, dispatch, disabled, lang }: Props) {
  const t = useTranslations("admin.assessments.builder");
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addingToSection, setAddingToSection] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{
    sectionId: string;
    question: Question;
  } | null>(null);
  const dragOverRef = useRef<number | null>(null);

  function handleDragStart(idx: number) {
    setDraggingIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    dragOverRef.current = idx;
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (draggingIdx !== null && dragOverRef.current !== null && draggingIdx !== dragOverRef.current) {
      dispatch({
        type: "REORDER_SECTIONS",
        fromIndex: draggingIdx,
        toIndex: dragOverRef.current,
      });
    }
    setDraggingIdx(null);
    dragOverRef.current = null;
  }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleAddQuestion(sectionId: string, question: Question) {
    dispatch({ type: "ADD_QUESTION", sectionId, question });
    setAddingToSection(null);
    setEditingQuestion({ sectionId, question });
  }

  function handleSaveQuestion(sectionId: string, question: Question) {
    dispatch({ type: "UPDATE_QUESTION", sectionId, question });
    setEditingQuestion(null);
  }

  return (
    <>
      {sections.map((section, idx) => (
        <div
          key={section.id}
          draggable={!disabled}
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={handleDrop}
          className={`border rounded-lg bg-background transition-opacity ${
            draggingIdx === idx ? "opacity-40" : "opacity-100"
          }`}
        >
          <SectionHeader
            section={section}
            isCollapsed={!!collapsed[section.id]}
            onToggleCollapse={() => toggleCollapse(section.id)}
            onUpdate={(update) =>
              dispatch({ type: "UPDATE_SECTION", sectionId: section.id, update })
            }
            onDelete={() => dispatch({ type: "REMOVE_SECTION", sectionId: section.id })}
            disabled={disabled}
            lang={lang}
          />

          {!collapsed[section.id] && (
            <div className="p-3 space-y-2">
              <SortableQuestionList
                sectionId={section.id}
                questions={section.questions}
                dispatch={dispatch}
                onEdit={(q) => setEditingQuestion({ sectionId: section.id, question: q })}
                disabled={disabled}
              />
              {!disabled && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setAddingToSection(section.id)}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  {t("addQuestion")}
                </Button>
              )}
            </div>
          )}
        </div>
      ))}

      {sections.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("emptyPreview")}
        </p>
      )}

      {/* Question type picker dialog */}
      <QuestionTypePicker
        open={addingToSection !== null}
        onClose={() => setAddingToSection(null)}
        onSelect={(type) => {
          if (!addingToSection) return;
          const id = `q-${Date.now()}`;
          const newQ: Question = {
            id,
            type: type as Question["type"],
            label: { de: "", en: "" },
            required: false,
            ...(type === "single-choice" || type === "multi-choice"
              ? { options: [{ value: "option-1", label: { de: "Option 1", en: "Option 1" } }] }
              : {}),
            ...(type === "info" ? { description: { de: "", en: "" } } : {}),
          } as Question;
          handleAddQuestion(addingToSection, newQ);
        }}
      />

      {/* Question editor sheet */}
      {editingQuestion && (
        <QuestionEditorSheet
          open={true}
          sectionId={editingQuestion.sectionId}
          question={editingQuestion.question}
          onSave={(q) => handleSaveQuestion(editingQuestion.sectionId, q)}
          onClose={() => setEditingQuestion(null)}
          lang={lang}
        />
      )}
    </>
  );
}
