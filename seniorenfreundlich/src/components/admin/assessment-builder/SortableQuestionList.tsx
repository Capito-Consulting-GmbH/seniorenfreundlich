"use client";

import { useState, useRef } from "react";
import type { Question } from "@/src/validators/assessment";
import type { Action } from "./types";
import { QuestionCard } from "./QuestionCard";

interface Props {
  sectionId: string;
  questions: Question[];
  dispatch: React.Dispatch<Action>;
  onEdit: (question: Question) => void;
  disabled?: boolean;
}

export function SortableQuestionList({
  sectionId,
  questions,
  dispatch,
  onEdit,
  disabled,
}: Props) {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
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
    if (
      draggingIdx !== null &&
      dragOverRef.current !== null &&
      draggingIdx !== dragOverRef.current
    ) {
      dispatch({
        type: "REORDER_QUESTIONS",
        sectionId,
        fromIndex: draggingIdx,
        toIndex: dragOverRef.current,
      });
    }
    setDraggingIdx(null);
    dragOverRef.current = null;
  }

  if (questions.length === 0) return null;

  return (
    <div className="space-y-1">
      {questions.map((question, idx) => (
        <div
          key={question.id}
          draggable={!disabled}
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={handleDrop}
          className={`transition-opacity ${draggingIdx === idx ? "opacity-40" : "opacity-100"}`}
        >
          <QuestionCard
            question={question}
            onEdit={() => onEdit(question)}
            onDelete={() =>
              dispatch({ type: "REMOVE_QUESTION", sectionId, questionId: question.id })
            }
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
