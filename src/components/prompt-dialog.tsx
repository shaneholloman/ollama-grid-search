import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { EnterFullScreenIcon } from "@radix-ui/react-icons";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import z from "zod";
import { Autocomplete } from "./Selectors/autocomplete";

interface IProps {
  content: string;
  handleChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    idx: number,
  ) => void;
  idx: number;
  fieldName: string;
  fieldLabel: string;
}

export function PromptDialog(props: IProps) {
  const { content, handleChange, idx, fieldName, fieldLabel } = props;
  const [open, setOpen] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track current variable selection
  const [selectedVariable, setSelectedVariable] = useState<{
    start: number;
    end: number;
    value: string;
  } | null>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    // When content changes, find and select the first variable
    if (textareaRef.current) {
      selectNextVariable(0);
    }
  }, [localContent]);

  const FormSchema = z.object({
    [fieldName]: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    values: {
      [fieldName]: localContent,
    },
  });

  function onSubmit() {
    setOpen(false);
  }

  // Find all variables in the text
  const findVariables = (text: string) => {
    const regex = /\[([^\]]+)\]/g;
    const variables: Array<{
      start: number;
      end: number;
      value: string;
    }> = [];

    let match;
    while ((match = regex.exec(text)) !== null) {
      variables.push({
        start: match.index,
        end: match.index + match[0].length,
        value: match[0],
      });
    }
    return variables;
  };

  // Select the next variable after the given position
  const selectNextVariable = (afterPosition: number) => {
    const variables = findVariables(localContent);
    const nextVariable = variables.find((v) => v.start > afterPosition);

    if (nextVariable && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        nextVariable.start,
        nextVariable.end,
      );
      setSelectedVariable(nextVariable);
    } else {
      setSelectedVariable(null);
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (selectedVariable) {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const beforeSelection = localContent.slice(0, selectedVariable.start);
      const afterSelection = localContent.slice(selectedVariable.end);
      const newContent = beforeSelection + pastedText + afterSelection;

      const syntheticEvent = {
        target: { value: newContent, name: fieldName },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      setLocalContent(newContent);
      handleChange(syntheticEvent, idx);

      // Select next variable after a short delay to allow state to update
      setTimeout(
        () => selectNextVariable(selectedVariable.start + pastedText.length),
        0,
      );
    }
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalContent(value);
    handleChange(e, idx);

    // Check for autocomplete trigger
    const shouldShowAutocomplete = value.startsWith("/");
    setShowAutocomplete(shouldShowAutocomplete);
  };

  // Shortcut to save updated prompt text
  useHotkeys("mod+enter", () => form.handleSubmit(onSubmit)(), {
    enableOnFormTags: ["TEXTAREA"],
  });

  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" type="button">
            <Tooltip>
              <TooltipTrigger asChild>
                <EnterFullScreenIcon className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>Expand {fieldLabel} input</TooltipContent>
            </Tooltip>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90%]">
          <form className="space-y-6">
            <DialogHeader>
              <DialogTitle>
                <span className="capitalize">{fieldLabel}</span> Editor
              </DialogTitle>
              <DialogDescription>
                Use this dialog to edit the contents of the {fieldLabel}.
                Variables like [input] can be replaced by pasting text.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex flex-col gap-4">
                <FormItem>
                  <FormLabel>
                    <span className="capitalize">{fieldLabel}</span>{" "}
                    <span className="text-sm text-gray-500">
                      (Changes are automatically saved)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        rows={15}
                        cols={100}
                        value={localContent}
                        onChange={handleLocalChange}
                        onPaste={handlePaste}
                        placeholder="Type '/' to search prompts..."
                      />
                      <Autocomplete
                        trigger={showAutocomplete}
                        index={idx}
                        inputText={localContent}
                        onSelect={(value) => {
                          const syntheticEvent = {
                            target: { value, name: fieldName },
                          } as React.ChangeEvent<HTMLTextAreaElement>;

                          setLocalContent(value);
                          handleChange(syntheticEvent, idx);
                          setShowAutocomplete(false);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                Close (Ctrl+Enter)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
