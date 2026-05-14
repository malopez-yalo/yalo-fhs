import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/layout";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Briefcase, CheckCircle2, Clock, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useTasks();

  if (projectsLoading || tasksLoading) {
    return (
      <Layout>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl mt-8" />
      </Layout>
    );
  }

  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
  const pendingTasks = tasks?.filter(t => t.status !== 'done').length || 0;
  const totalTasks = tasks?.length || 0;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart Data Preparation
  const tasksByStatus = [
    { name: 'To Do', value: tasks?.filter(t => t.status === 'todo').length || 0, color: '#94a3b8' },
    { name: 'In Progress', value: tasks?.filter(t => t.status === 'in_progress').length || 0, color: '#3b82f6' },
    { name: 'Review', value: tasks?.filter(t => t.status === 'review').length || 0, color: '#f59e0b' },
    { name: 'Done', value: tasks?.filter(t => t.status === 'done').length || 0, color: '#10b981' },
  ];

  const tasksByProject = projects?.map(p => ({
    name: p.name,
    tasks: tasks?.filter(t => t.projectId === p.id).length || 0
  })).slice(0, 5) || [];

  return (
    <Layout>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Active Projects" 
          value={activeProjects} 
          icon={Briefcase} 
          color="text-blue-500"
          trend="+2 this month"
        />
        <StatsCard 
          title="Tasks Completed" 
          value={completedTasks} 
          icon={CheckCircle2} 
          color="text-emerald-500"
          trend="12 this week"
        />
        <StatsCard 
          title="Pending Tasks" 
          value={pendingTasks} 
          icon={Clock} 
          color="text-orange-500"
          trend="5 overdue"
        />
        <StatsCard 
          title="Completion Rate" 
          value={`${completionRate}%`} 
          icon={Activity} 
          color="text-purple-500"
          trend="+5% from last week"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card className="col-span-1 shadow-lg shadow-black/5 border-border/50">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-sm mt-4">
                {tasksByStatus.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-lg shadow-black/5 border-border/50">
          <CardHeader>
            <CardTitle>Tasks per Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tasksByProject}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function StatsCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
