"use client";

import { useState, useRef, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  uploadAssessmentFileAction,
  deleteAssessmentFileAction,
} from "@/src/actions/assessmentActions";
import { Button } from "@/src/components/ui/button";
import { Upload, Trash2, Loader2 } from "lucide-react";

interface FileUploadQuestionType {
  type: "file-upload";
  maxFiles?: number;
  maxSizeMb?: number;
  accept?: string[];
}

interface UploadedFile {
  id: string;
  filename: string;
  blobUrl: string;
}

interface Props {
  question: FileUploadQuestionType;
  submissionId: string;
  questionId: string;
  disabled?: boolean;
  locale: "de" | "en";
  initialFiles?: UploadedFile[];
}

export function FileUploadQuestion({
  question,
  submissionId,
  questionId,
  disabled,
  locale,
  initialFiles = [],
}: Props) {
  const t = useTranslations("assessment");
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const maxFiles = question.maxFiles ?? 5;
  const maxSizeBytes = (question.maxSizeMb ?? 10) * 1024 * 1024;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (files.length >= maxFiles) {
      setError(t("maxFilesReached"));
      return;
    }
    if (file.size > maxSizeBytes) {
      setError(`Max. ${question.maxSizeMb ?? 10} MB`);
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append("submissionId", submissionId);
    formData.append("questionId", questionId);
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadAssessmentFileAction(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.fileId && result.blobUrl && result.filename) {
        setFiles((prev) => [
          ...prev,
          { id: result.fileId!, blobUrl: result.blobUrl!, filename: result.filename! },
        ]);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleDelete(fileId: string) {
    startTransition(async () => {
      const result = await deleteAssessmentFileAction(fileId, submissionId, questionId);
      if (!result.error) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    });
  }

  return (
    <div className="space-y-3">
      {files.map((f) => (
        <div
          key={f.id}
          className="flex items-center justify-between px-3 py-2 border rounded-md text-sm"
        >
          <a
            href={f.blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate flex-1"
          >
            {f.filename}
          </a>
          {!disabled && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive ml-2 shrink-0"
              onClick={() => handleDelete(f.id)}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}

      {!disabled && files.length < maxFiles && (
        <div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={question.accept?.join(",")}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isPending || disabled}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isPending ? t("uploading") : t("uploadFile")}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
