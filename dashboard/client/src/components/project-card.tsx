import { Project } from "@shared/schema";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteProject } from "@/hooks/use-projects";
import { useState } from "react";
import { EditProjectDialog } from "./edit-project-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectCardProps {
  project: Project;
  taskCount?: number;
  completedCount?: number;
}

export function ProjectCard({ project, taskCount = 0, completedCount = 0 }: ProjectCardProps) {
  const deleteProject = useDeleteProject();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "completed": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "on_hold": return "bg-orange-500/10 text-orange-600 border-orange-200";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 border-border/60 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <Badge variant="outline" className={`capitalize font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace("_", " ")}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">
            {project.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-secondary" />
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t bg-slate-50/50">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-2 h-3.5 w-3.5" />
            {project.dueDate 
              ? `Due ${format(new Date(project.dueDate), "MMM d, yyyy")}`
              : "No due date"}
          </div>
        </CardFooter>
      </Card>

      <EditProjectDialog 
        project={project} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{project.name}" and all associated tasks.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteProject.mutate(project.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
