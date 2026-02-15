import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Upload, Download, FileText, Image as ImageIcon, CheckCircle2, Circle, Plus, X, Send, ExternalLink, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [files, setFiles] = useState([]);
  const [srsDocuments, setSrsDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newMilestone, setNewMilestone] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, filesRes, srsRes, messagesRes] = await Promise.all([
        axios.get(`${API}/projects/${id}`),
        axios.get(`${API}/files/${id}`),
        axios.get(`${API}/srs/${id}`),
        axios.get(`${API}/messages/${id}`)
      ]);
      setProject(projectRes.data);
      setFiles(filesRes.data);
      setSrsDocuments(srsRes.data);
      setMessages(messagesRes.data);
      
      const clientRes = await axios.get(`${API}/clients/${projectRes.data.client_id}`);
      setClient(clientRes.data);
    } catch (error) {
      toast.error('Failed to fetch project data');
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (updates) => {
    try {
      await axios.put(`${API}/projects/${id}`, updates);
      toast.success('Project updated');
      fetchProjectData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    const updatedMilestones = [...(project.milestones || []), { id: Date.now().toString(), title: newMilestone, completed: false }];
    updateProject({ milestones: updatedMilestones });
    setNewMilestone('');
  };

  const toggleMilestone = (milestoneId) => {
    const updatedMilestones = project.milestones.map(m => 
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    updateProject({ milestones: updatedMilestones });
  };

  const deleteMilestone = (milestoneId) => {
    const updatedMilestones = project.milestones.filter(m => m.id !== milestoneId);
    updateProject({ milestones: updatedMilestones });
  };

  const handleFileUpload = async (e, category = 'general') => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', id);
    formData.append('category', category);
    
    try {
      await axios.post(`${API}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('File uploaded');
      fetchProjectData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSRSUpload = async (e, title, version) => {
    const file = e.target.files[0];
    if (!file || !title || !version) {
      toast.error('Please provide title and version');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', id);
    formData.append('title', title);
    formData.append('version', version);
    
    try {
      await axios.post(`${API}/srs`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('SRS uploaded');
      fetchProjectData();
    } catch (error) {
      toast.error('Upload failed');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(`${API}/messages`, { project_id: id, message: newMessage });
      setNewMessage('');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`${API}/projects/${id}`);
        toast.success('Project deleted');
        navigate('/admin/projects');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  if (loading) return <div className="flex"><Sidebar /><div className="flex-1 p-8"><p>Loading...</p></div></div>;
  if (!project) return <div className="flex"><Sidebar /><div className="flex-1 p-8"><p>Project not found</p></div></div>;

  const shareLink = `${window.location.origin}/project/${project.share_link}`;
  const remaining = project.total_price - project.amount_paid;

  return (
    <div className="flex" data-testid="project-detail-page">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <Link to="/admin/projects" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2" data-testid="project-detail-title">{project.title}</h1>
              <p className="text-muted-foreground">Client: {client?.name}</p>
            </div>
            <Button variant="destructive" onClick={handleDelete} data-testid="delete-project-btn">
              Delete Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-2xl font-bold">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="mb-4" />
            <Slider
              value={[project.progress]}
              onValueChange={([value]) => updateProject({ progress: value })}
              max={100}
              step={5}
              data-testid="progress-slider"
            />
          </Card>
          
          <Card className="p-6 stat-card">
            <Label className="text-sm text-muted-foreground mb-2 block">Status</Label>
            <Select value={project.status} onValueChange={(value) => updateProject({ status: value })}>
              <SelectTrigger data-testid="status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="designing">Designing</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6 stat-card">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Price</span>
                <span className="font-mono font-semibold">${project.total_price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Paid</span>
                <span className="font-mono text-green-500">${project.amount_paid}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="font-mono text-red-500">${remaining}</span>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList data-testid="project-tabs">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="srs">SRS Documents</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" data-testid="overview-tab">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-heading font-semibold text-xl mb-4">Project Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-heading font-semibold text-xl mb-4">Share Link</h3>
                <p className="text-sm text-muted-foreground mb-3">Share this link with your client to view project progress</p>
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly data-testid="share-link-input" />
                  <Button
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      toast.success('Link copied!');
                    }}
                    data-testid="copy-link-btn"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="milestones" data-testid="milestones-tab">
            <Card className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Milestones</h3>
              <div className="space-y-3 mb-4">
                {(project.milestones || []).map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-3 p-3 rounded-lg border border-border" data-testid={`milestone-${milestone.id}`}>
                    <button
                      onClick={() => toggleMilestone(milestone.id)}
                      className="flex-shrink-0"
                      data-testid={`toggle-milestone-${milestone.id}`}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    <span className={`flex-1 ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {milestone.title}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMilestone(milestone.id)}
                      data-testid={`delete-milestone-${milestone.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new milestone..."
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
                  data-testid="new-milestone-input"
                />
                <Button onClick={handleAddMilestone} data-testid="add-milestone-btn">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="files" data-testid="files-tab">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-xl">Files & Images</h3>
                <Button disabled={uploadingFile} data-testid="upload-file-btn">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploadingFile ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'general')}
                      disabled={uploadingFile}
                    />
                  </label>
                </Button>
              </div>
              {files.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No files uploaded yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <Card key={file.id} className="p-4" data-testid={`file-${file.id}`}>
                      <div className="flex items-start gap-3">
                        {file.file_type.startsWith('image/') ? (
                          <ImageIcon className="w-8 h-8 text-primary" />
                        ) : (
                          <FileText className="w-8 h-8 text-primary" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">{file.category}</p>
                          <p className="text-xs text-muted-foreground">{new Date(file.created_at).toLocaleDateString()}</p>
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            <Download className="w-3 h-3" /> View
                          </a>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="srs" data-testid="srs-tab">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-xl">SRS Documents</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button data-testid="upload-srs-btn">
                      <Upload className="w-4 h-4 mr-2" /> Upload SRS
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload SRS Document</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const fileInput = e.target.file;
                      handleSRSUpload({ target: { files: [fileInput.files[0]] } }, formData.get('title'), formData.get('version'));
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Document Title</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div>
                        <Label htmlFor="version">Version</Label>
                        <Input id="version" name="version" placeholder="e.g., v1.0" required />
                      </div>
                      <div>
                        <Label htmlFor="file">File</Label>
                        <Input id="file" name="file" type="file" required />
                      </div>
                      <Button type="submit" className="w-full">Upload</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {srsDocuments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No SRS documents yet</p>
              ) : (
                <div className="space-y-3">
                  {srsDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`srs-${doc.id}`}>
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">Version {doc.version} • {new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge>{doc.status}</Badge>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" /> Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="messages" data-testid="messages-tab">
            <Card className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Messages</h3>
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-lg border border-border" data-testid={`message-${msg.id}`}>
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
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={2}
                  data-testid="new-message-input"
                />
                <Button onClick={sendMessage} data-testid="send-message-btn">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" data-testid="settings-tab">
            <Card className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Project Settings</h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="total_price">Total Price ($)</Label>
                  <Input
                    id="total_price"
                    type="number"
                    value={project.total_price}
                    onChange={(e) => updateProject({ total_price: parseFloat(e.target.value) })}
                    data-testid="total-price-input"
                  />
                </div>
                <div>
                  <Label htmlFor="amount_paid">Amount Paid ($)</Label>
                  <Input
                    id="amount_paid"
                    type="number"
                    value={project.amount_paid}
                    onChange={(e) => updateProject({ amount_paid: parseFloat(e.target.value) })}
                    data-testid="amount-paid-input"
                  />
                </div>
                <div>
                  <Label htmlFor="google_sheet_link">Google Sheets Payment Link</Label>
                  <Input
                    id="google_sheet_link"
                    value={project.google_sheet_link || ''}
                    onChange={(e) => updateProject({ google_sheet_link: e.target.value })}
                    placeholder="https://docs.google.com/spreadsheets/..."
                    data-testid="google-sheet-input"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="is_portfolio"
                    checked={project.is_portfolio}
                    onCheckedChange={(checked) => updateProject({ is_portfolio: checked })}
                    data-testid="portfolio-switch"
                  />
                  <Label htmlFor="is_portfolio" className="cursor-pointer">
                    Show in public portfolio
                  </Label>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjectDetail;
