import { Layout } from "@/components/layout";
import { useTasks } from "@/hooks/use-tasks";
import { useUpdateTask } from "@/hooks/use-tasks";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Loader2, MoreVertical, Trash2 } from "lucide-react";
import { useDeleteTask } from "@/hooks/use-tasks";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-slate-100" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-50" },
  { id: "review", title: "Review", color: "bg-orange-50" },
  { id: "done", title: "Done", color: "bg-emerald-50" },
];

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const taskId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;

    if (newStatus !== result.source.droppableId) {
      updateTask.mutate({ id: taskId, status: newStatus });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100 border-red-200";
      case "medium": return "text-orange-600 bg-orange-100 border-orange-200";
      default: return "text-blue-600 bg-blue-100 border-blue-200";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Task Board</h1>
          <p className="text-muted-foreground">Drag and drop tasks to update their status.</p>
        </div>
        <CreateTaskDialog />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid md:grid-cols-4 gap-6 h-full min-h-[500px]">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col gap-4">
              <div className={`p-4 rounded-xl ${column.color} border border-border/50`}>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  {column.title}
                </h3>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 space-y-3"
                  >
                    {tasks
                      ?.filter((task) => task.status === column.id)
                      .map((task, index) => (
                        <Draggable 
                          key={task.id} 
                          draggableId={task.id.toString()} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                group hover:shadow-lg transition-all border-border/50
                                ${snapshot.isDragging ? "shadow-xl rotate-2" : ""}
                              `}
                            >
                              <CardHeader className="p-4 pb-2 flex flex-row justify-between space-y-0">
                                <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => deleteTask.mutate(task.id)}
                                    >
                                      <Trash2 className="mr-2 h-3 w-3" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <p className="font-medium text-sm mb-1">{task.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </Layout>
  );
}
