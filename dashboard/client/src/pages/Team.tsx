import { Layout } from "@/components/layout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin } from "lucide-react";

// Mock data since we don't have a user schema yet
const TEAM_MEMBERS = [
  { id: 1, name: "Alice Johnson", role: "Frontend Developer", status: "online", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { id: 2, name: "Bob Smith", role: "Backend Engineer", status: "busy", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop" },
  { id: 3, name: "Carol White", role: "Designer", status: "offline", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { id: 4, name: "Dave Brown", role: "Product Manager", status: "online", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
];

export default function Team() {
  return (
    <Layout>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Team</h1>
        <p className="text-muted-foreground">Meet the people making it happen.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TEAM_MEMBERS.map((member) => (
          <Card key={member.id} className="group hover:shadow-lg transition-all duration-300 border-border/60">
            <CardHeader className="flex flex-col items-center pb-2">
              <div className="relative">
                {/* Descriptive comment for Unsplash URL */}
                {/* Professional headshot portrait */}
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg mb-4">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <span className={`absolute bottom-4 right-2 w-4 h-4 rounded-full border-2 border-background
                  ${member.status === 'online' ? 'bg-green-500' : 
                    member.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'}`} 
                />
              </div>
              <h3 className="font-display font-bold text-lg">{member.name}</h3>
              <Badge variant="secondary" className="mt-1 font-normal text-muted-foreground bg-slate-100">
                {member.role}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary/60" />
                  <span className="truncate">{member.name.toLowerCase().replace(" ", ".")}@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary/60" />
                  <span>+1 (555) 000-0000</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary/60" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
              
              <Button className="w-full mt-4" variant="outline">View Profile</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
