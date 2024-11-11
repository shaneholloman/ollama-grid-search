import { IPrompt } from "@/Interfaces";
import { FilePlusIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useToast } from "../ui/use-toast";

interface IProps {
  prompts: IPrompt[];
  currentPrompt: IPrompt | null;
  setCurrentPrompt: (prompt: IPrompt) => void;
}

export function PromptList(props: IProps) {
  const { prompts, currentPrompt, setCurrentPrompt } = props;
  const { toast } = useToast();

  const addPromptToExperiment = (prompt: IPrompt) => {
    //TODO: Implement this
    console.log("prompt to be added", prompt);
    toast({
      variant: "success",
      title: "Prompt added.",
      duration: 2000,
    });
  };

  return (
    <ul className="space-y-2">
      {prompts.map((prompt: IPrompt) => (
        <div
          key={prompt.uuid}
          onClick={() => setCurrentPrompt(prompt)}
          className={`flex cursor-pointer items-center rounded p-1 hover:cursor-pointer ${
            currentPrompt && prompt.uuid === currentPrompt.uuid
              ? "bg-gray-100 dark:bg-gray-800"
              : ""
          }`}
        >
          <span className="flex-1">{prompt.name}</span>
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="transparentDark" size="icon">
                  <FilePlusIcon
                    className="h-5 w-5"
                    onClick={() => addPromptToExperiment(prompt)}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={5}>
                Add this prompt to experiment
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      ))}
    </ul>
  );
}
