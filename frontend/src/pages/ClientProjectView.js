import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, DollarSign, CheckCircle2, Circle, FileText, Download, Send, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ClientProjectView = () => {
  const { shareLink } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [shareLink]);

  const fetchProjectData = async () => {
    try {
      const response = await axios.get(`${API}/projects/share/${shareLink}`);
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center"><p>Project not found</p></div>;

  const { project, client, messages, files, srs_documents } = data;
  const remaining = project.total_price - project.amount_paid;

  return (
    <div className="min-h-screen bg-background" data-testid="client-project-view">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="font-heading font-bold text-2xl" data-testid="client-nav-title">ClientFlow</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-4xl mb-2" data-testid="client-project-title">{project.title}</h1>
          <p className="text-lg text-muted-foreground">Client: {client?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-2xl font-bold">{project.progress}%</span>
            </div>
            <Progress value={project.progress} />
          </Card>
          
          <Card className="p-6 stat-card">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge>{project.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 stat-card">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-mono font-semibold">₹{project.total_price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Paid</span>
                <span className="font-mono text-green-500">₹{project.amount_paid}</span>
              </div>
              {remaining > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due</span>
                  <span className="font-mono text-red-500">₹{remaining}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-heading font-semibold text-xl mb-4">Project Details</h3>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Started: {new Date(project.start_date).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-heading font-semibold text-xl mb-4">Milestones</h3>
            <div className="space-y-2">
              {(project.milestones || []).length === 0 ? (
                <p className="text-muted-foreground text-sm">No milestones yet</p>
              ) : (
                project.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-2">
                    {milestone.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                      {milestone.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {project.google_sheet_link && (
          <Card className="p-6 mb-8">
            <h3 className="font-heading font-semibold text-xl mb-4">Payment Tracking</h3>
            <a
              href={project.google_sheet_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              View Payment Details in Google Sheets
            </a>
          </Card>
        )}

        {files.length > 0 && (
          <Card className="p-6 mb-8">
            <h3 className="font-heading font-semibold text-xl mb-4">Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.filename}</p>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {srs_documents.length > 0 && (
          <Card className="p-6 mb-8">
            <h3 className="font-heading font-semibold text-xl mb-4">SRS Documents</h3>
            <div className="space-y-3">
              {srs_documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">Version {doc.version}</p>
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-heading font-semibold text-xl mb-4">Messages</h3>
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="p-3 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{msg.sender_name}</span>
                  <Badge variant="outline" className="text-xs">{msg.sender_role}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{msg.message}</p>
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>To send messages, please contact your project manager directly.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClientProjectView;