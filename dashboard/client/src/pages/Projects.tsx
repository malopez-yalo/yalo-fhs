import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project-card";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Projects() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks } = useTasks();
  const [search, setSearch] = useState("");

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage and organize your team's work.</p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search projects..." 
          className="pl-10 max-w-md bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {projectsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredProjects?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground mb-4">No projects found matching your search.</p>
          <CreateProjectDialog />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects?.map((project) => {
            const projectTasks = tasks?.filter(t => t.projectId === project.id) || [];
            const completedTasks = projectTasks.filter(t => t.status === 'done').length;
            
            return (
              <ProjectCard 
                key={project.id} 
                project={project} 
                taskCount={projectTasks.length}
                completedCount={completedTasks}
              />
            );
          })}
        </div>
      )}
    </Layout>
  );
}
