import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Award, BookOpen, Calendar, CheckCircle, Clock, Download, Filter, Play, Search, Star, Trophy, Target, TrendingUp, Eye, BarChart3, Shield, Settings, ArrowLeft, User } from 'lucide-react';
import AddAthleteSkillDialog from '@/components/admin/AddAthleteSkillDialog';
import { TestSkillDialog } from '@/components/admin/TestSkillDialog';
import type { Skill as SharedSkill } from '@shared/schema';

type ProgressVideo = {
  id: number;
  url?: string | null;
  title?: string | null;
  recordedAt?: string | Date | null;
};

type ProgressSkill = {
  athleteSkill: any;
  skill?: { id: number; name?: string | null; level?: string | number | null; category?: string | null; apparatusId?: number | null } | null;
  videos: ProgressVideo[];
};

export interface ProgressData {
  athlete: any;
  skills: ProgressSkill[];
}

export default function ProgressView({ data, isAdmin = false }: { data: any; isAdmin?: boolean }) {
  const [openVideo, setOpenVideo] = React.useState<{ url: string; title?: string } | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [showEditAthlete, setShowEditAthlete] = React.useState(false);
  const [selectedSkillForTest, setSelectedSkillForTest] = React.useState<any>(null);
  const [showAddSkillDialog, setShowAddSkillDialog] = React.useState(false);
  const [testingSkill, setTestingSkill] = React.useState<{ skill: SharedSkill; athleteSkillId?: number; status?: string | null; notes?: string | null } | null>(null);

  const isDirectVideoUrl = React.useCallback((url?: string | null) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      const path = u.pathname.toLowerCase();
      return /(\.mp4|\.webm|\.m4v|\.mov|\.ogg|\.ogv)$/i.test(path);
    } catch {
      return /(\.mp4|\.webm|\.m4v|\.mov|\.ogg|\.ogv)$/i.test(url.toLowerCase());
    }
  }, []);

  const a = data.athlete;

  // Filter skills based on search and filters
  const filteredSkills = React.useMemo(() => {
    return (data.skills as ProgressSkill[]).filter((skill) => {
      const matchesSearch = !searchTerm || 
        skill.skill?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.skill?.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        skill.athleteSkill?.status?.toLowerCase() === statusFilter;
      
      const matchesCategory = categoryFilter === 'all' || 
        skill.skill?.category?.toLowerCase() === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [data.skills, searchTerm, statusFilter, categoryFilter]);

  // Get unique categories for filter
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    data.skills.forEach((skill: ProgressSkill) => {
      if (skill.skill?.category) {
        cats.add(skill.skill.category.toLowerCase());
      }
    });
    return Array.from(cats);
  }, [data.skills]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const statusCounts = {
      mastered: 0,
      consistent: 0,
      working: 0,
      learning: 0
    };
    
    data.skills.forEach((skill: ProgressSkill) => {
      const status = skill.athleteSkill?.status?.toLowerCase();
      if (status && status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++;
      }
    });

    const totalSkills = data.skills.length;
    const skillsWithVideos = data.skills.filter((s: ProgressSkill) => s.videos.length > 0).length;
    const totalVideos = data.skills.reduce((acc: number, s: ProgressSkill) => acc + s.videos.length, 0);

    return {
      ...statusCounts,
      totalSkills,
      skillsWithVideos,
      totalVideos,
      progressPercentage: totalSkills > 0 ? Math.round((statusCounts.mastered / totalSkills) * 100) : 0
    };
  }, [data.skills]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-[#0F0276] via-[#1a0b8e] to-[#0F0276] text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col space-y-3">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {a?.name || `${a?.firstName || ''} ${a?.lastName || ''}`.trim()}
              </h1>
              <p className="text-blue-100 flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-[#D8BD2A]" />
                <span>Skills Progress Dashboard</span>
              </p>
            </div>
            
            {/* Stats Overview in Header */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#D8BD2A]">{stats.totalSkills}</div>
                <div className="text-xs text-blue-100">Total Skills</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.mastered}</div>
                <div className="text-xs text-blue-100">Mastered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.totalVideos}</div>
                <div className="text-xs text-blue-100">Videos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.progressPercentage}%</div>
                <div className="text-xs text-blue-100">Progress</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Toolbar */}
      {isAdmin && (
        <div className="bg-orange-500/90 backdrop-blur-sm border-b border-orange-600/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-white" />
                <span className="text-white font-medium">Admin View</span>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Enhanced Controls
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => setShowEditAthlete(true)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  View Athlete
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => setShowAddSkillDialog(true)}
                >
                  <Target className="h-4 w-4 mr-1" />
                  Test Skills
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => window.location.href = '/admin'}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Admin Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Progress Summary */}
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 dark:bg-white/10 dark:border-white/20 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#0F0276] dark:text-white">
                    <TrendingUp className="h-5 w-5 text-[#D8BD2A]" />
                    Progress Summary
                  </CardTitle>
                  <CardDescription className="text-[#0F0276]/70 dark:text-white/70">
                    Skill mastery breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { key: 'mastered', label: 'Mastered', count: stats.mastered, color: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-300' },
                      { key: 'consistent', label: 'Consistent', count: stats.consistent, color: 'bg-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-700 dark:text-purple-300' },
                      { key: 'working', label: 'Working', count: stats.working, color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-300' },
                      { key: 'learning', label: 'Learning', count: stats.learning, color: 'bg-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-700 dark:text-amber-300' },
                    ].map(({ key, label, count, color, bgColor, textColor }) => (
                      <div key={key} className={`rounded-lg p-4 ${bgColor}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`text-sm font-medium ${textColor}`}>{label}</div>
                            <div className={`text-2xl font-bold ${textColor}`}>{count}</div>
                          </div>
                          <div className={`w-3 h-12 rounded-full ${color}`}></div>
                        </div>
                        {stats.totalSkills > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${color}`}
                                style={{ width: `${(count / stats.totalSkills) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 dark:bg-white/10 dark:border-white/20 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#0F0276] dark:text-white">
                    <Award className="h-5 w-5 text-[#D8BD2A]" />
                    Latest Achievements
                  </CardTitle>
                  <CardDescription className="text-[#0F0276]/70 dark:text-white/70">
                    Recently mastered skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredSkills.filter(s => s.athleteSkill?.status?.toLowerCase() === 'mastered').slice(0, 5).map((skill) => (
                      <div key={skill.athleteSkill.id} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-green-800 dark:text-green-200 truncate">
                            {skill.skill?.name || `Skill #${skill.athleteSkill.skillId}`}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            {skill.skill?.category && `${skill.skill.category} • `}
                            {skill.videos.length} video{skill.videos.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredSkills.filter(s => s.athleteSkill?.status?.toLowerCase() === 'mastered').length === 0 && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm">No mastered skills yet</p>
                        <p className="text-xs">Keep practicing to earn achievements!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Video Statistics */}
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 dark:bg-white/10 dark:border-white/20 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#0F0276] dark:text-white">
                    <Eye className="h-5 w-5 text-[#D8BD2A]" />
                    Video Progress
                  </CardTitle>
                  <CardDescription className="text-[#0F0276]/70 dark:text-white/70">
                    Documentation overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalVideos}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Total Videos</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.skillsWithVideos}</div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">Skills with Videos</div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[#0F0276] dark:text-white">Video Coverage</span>
                        <span className="text-[#0F0276] dark:text-white">
                          {stats.totalSkills > 0 ? Math.round((stats.skillsWithVideos / stats.totalSkills) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ 
                            width: `${stats.totalSkills > 0 ? (stats.skillsWithVideos / stats.totalSkills) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 dark:bg-white/10 dark:border-white/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#0F0276] dark:text-white">
                  <Filter className="h-5 w-5 text-[#D8BD2A]" />
                  Filter Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0F0276] dark:text-white">Search Skills</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/70 border-slate-200/60 focus:border-[#0F0276] focus:ring-[#0F0276]/20 dark:bg-white/10 dark:border-white/20 dark:focus:border-white/40"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0F0276] dark:text-white">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-white/70 border-slate-200/60 focus:border-[#0F0276] focus:ring-[#0F0276]/20 dark:bg-white/10 dark:border-white/20 dark:focus:border-white/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="mastered">Mastered</SelectItem>
                        <SelectItem value="consistent">Consistent</SelectItem>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0F0276] dark:text-white">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="bg-white/70 border-slate-200/60 focus:border-[#0F0276] focus:ring-[#0F0276]/20 dark:bg-white/10 dark:border-white/20 dark:focus:border-white/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSkills.map((skill) => (
                <Card key={skill.athleteSkill.id} className="bg-white/60 backdrop-blur-sm border-slate-200/60 dark:bg-white/10 dark:border-white/20 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-800/50 dark:to-slate-700/50 pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold text-[#0F0276] dark:text-white">
                        {skill.skill?.name || `Skill #${skill.athleteSkill.skillId}`}
                      </CardTitle>
                      {skill.athleteSkill.status && (
                        <Badge className={
                          skill.athleteSkill.status.toLowerCase() === 'mastered' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300' 
                            : skill.athleteSkill.status.toLowerCase() === 'consistent' 
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300'
                            : skill.athleteSkill.status.toLowerCase() === 'working' 
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300'
                        }>
                          {skill.athleteSkill.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center mt-2 text-xs text-[#0F0276]/70 dark:text-white/70 space-x-4">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {(() => {
                          const d = (skill.athleteSkill.updatedAt ?? skill.athleteSkill.createdAt) as any;
                          return d ? new Date(d).toLocaleDateString() : '—';
                        })()}
                      </span>
                      {skill.skill?.level && (
                        <span>Level: {skill.skill.level}</span>
                      )}
                      {skill.skill?.category && (
                        <span>Category: {skill.skill.category}</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {skill.athleteSkill.notes && (
                      <div className="mb-4">
                        <div className="text-xs font-medium text-[#0F0276]/70 dark:text-white/70 uppercase tracking-wider mb-2">
                          Coach Notes
                        </div>
                        <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30 rounded-md p-3 text-sm whitespace-pre-wrap text-[#0F0276] dark:text-white">
                          {skill.athleteSkill.notes}
                        </div>
                      </div>
                    )}
                    
                    {skill.videos.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-medium text-[#0F0276]/70 dark:text-white/70 uppercase tracking-wider">
                            Progress Videos
                          </div>
                          <div className="text-xs text-[#0F0276]/70 dark:text-white/70">
                            {skill.videos.length} video{skill.videos.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {skill.videos.map((video) => {
                            const direct = isDirectVideoUrl(video.url);
                            return (
                              <div key={video.id} className="group">
                                {direct ? (
                                  <button
                                    type="button"
                                    onClick={() => video.url && setOpenVideo({ url: video.url, title: video.title || undefined })}
                                    className="w-full text-left"
                                  >
                                    <AspectRatio ratio={16/9} className="overflow-hidden rounded-md shadow-sm">
                                      <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                                        <video
                                          className="absolute inset-0 h-full w-full object-cover opacity-90"
                                          src={video.url || undefined}
                                          muted
                                          playsInline
                                          preload="metadata"
                                          onLoadedMetadata={(e) => {
                                            const vid = e.currentTarget as HTMLVideoElement;
                                            try {
                                              vid.currentTime = 0;
                                              vid.pause();
                                            } catch {}
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="rounded-full bg-[#0F0276]/90 p-3 shadow-md group-hover:scale-110 group-hover:bg-[#0F0276] transition-transform">
                                            <Play className="h-4 w-4 text-white" fill="white" />
                                          </div>
                                        </div>
                                      </div>
                                    </AspectRatio>
                                    <div className="mt-2 space-y-1">
                                      <div className="text-xs font-medium truncate text-[#0F0276] dark:text-white" title={video.title || video.url || ''}>
                                        {video.title || 'Untitled Video'}
                                      </div>
                                      {video.recordedAt && (
                                        <div className="flex items-center text-[10px] text-[#0F0276]/70 dark:text-white/70">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          {new Date(video.recordedAt as any).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                ) : (
                                  <div className="p-3 border border-slate-200/60 dark:border-white/20 rounded-md bg-white/50 dark:bg-white/5">
                                    <a 
                                      className="text-[#0F0276] hover:text-[#0F0276]/80 dark:text-white dark:hover:text-white/80 font-medium text-sm flex items-center gap-1" 
                                      href={video.url || undefined} 
                                      target="_blank" 
                                      rel="noreferrer"
                                    >
                                      <Play className="h-3 w-3" />
                                      {video.title || video.url}
                                    </a>
                                    {video.recordedAt && (
                                      <div className="flex items-center text-[10px] text-[#0F0276]/70 dark:text-white/70 mt-1">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(video.recordedAt as any).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {skill.videos.length === 0 && (
                      <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                        <Play className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="text-xs">No videos recorded yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredSkills.length === 0 && (
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 dark:bg-white/10 dark:border-white/20">
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <h3 className="text-lg font-medium text-[#0F0276] dark:text-white mb-2">No skills found</h3>
                  <p className="text-[#0F0276]/70 dark:text-white/70">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.skills.flatMap((skill: ProgressSkill) => 
                skill.videos.map((video) => ({
                  ...video,
                  skillName: skill.skill?.name || `Skill #${skill.athleteSkill.skillId}`,
                  skillStatus: skill.athleteSkill.status
                }))
              ).map((video: any) => {
                const direct = isDirectVideoUrl(video.url);
                return (
                  <Card key={video.id} className="bg-white/60 backdrop-blur-sm border-slate-200/60 dark:bg-white/10 dark:border-white/20 overflow-hidden group hover:shadow-lg transition-shadow">
                    {direct ? (
                      <button
                        type="button"
                        onClick={() => video.url && setOpenVideo({ url: video.url, title: video.title || undefined })}
                        className="w-full text-left"
                      >
                        <AspectRatio ratio={16/9} className="overflow-hidden">
                          <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                            <video
                              className="absolute inset-0 h-full w-full object-cover opacity-90"
                              src={video.url || undefined}
                              muted
                              playsInline
                              preload="metadata"
                              onLoadedMetadata={(e) => {
                                const vid = e.currentTarget as HTMLVideoElement;
                                try {
                                  vid.currentTime = 0;
                                  vid.pause();
                                } catch {}
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="rounded-full bg-[#0F0276]/90 p-3 shadow-md group-hover:scale-110 group-hover:bg-[#0F0276] transition-transform">
                                <Play className="h-5 w-5 text-white" fill="white" />
                              </div>
                            </div>
                          </div>
                        </AspectRatio>
                      </button>
                    ) : (
                      <div className="p-4">
                        <a 
                          className="text-[#0F0276] hover:text-[#0F0276]/80 dark:text-white dark:hover:text-white/80 font-medium text-sm flex items-center gap-1" 
                          href={video.url || undefined} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <Play className="h-4 w-4" />
                          External Video
                        </a>
                      </div>
                    )}
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-[#0F0276] dark:text-white truncate">
                          {video.title || 'Untitled Video'}
                        </h4>
                        <p className="text-xs text-[#0F0276]/70 dark:text-white/70 truncate">
                          {video.skillName}
                        </p>
                        {video.skillStatus && (
                          <Badge className={`text-xs ${
                            video.skillStatus.toLowerCase() === 'mastered' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                              : video.skillStatus.toLowerCase() === 'consistent' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                              : video.skillStatus.toLowerCase() === 'working' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}>
                            {video.skillStatus}
                          </Badge>
                        )}
                        {video.recordedAt && (
                          <div className="flex items-center text-[10px] text-[#0F0276]/70 dark:text-white/70">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(video.recordedAt as any).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {stats.totalVideos === 0 && (
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 dark:bg-white/10 dark:border-white/20">
                <CardContent className="text-center py-12">
                  <Play className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <h3 className="text-lg font-medium text-[#0F0276] dark:text-white mb-2">No videos available</h3>
                  <p className="text-[#0F0276]/70 dark:text-white/70">Videos will appear here as progress is documented</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.filter(s => s.athleteSkill?.status?.toLowerCase() === 'mastered').map((skill) => (
                <Card key={skill.athleteSkill.id} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700/30 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-green-800 dark:text-green-200">
                          {skill.skill?.name || `Skill #${skill.athleteSkill.skillId}`}
                        </CardTitle>
                        <CardDescription className="text-green-600 dark:text-green-400">
                          Mastered Skill
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {skill.skill?.category && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                            {skill.skill.category}
                          </Badge>
                          {skill.skill?.level && (
                            <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-600 dark:text-green-300">
                              Level {skill.skill.level}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {skill.videos.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                          <Play className="h-4 w-4" />
                          {skill.videos.length} progress video{skill.videos.length !== 1 ? 's' : ''} recorded
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Completed on {(() => {
                          const d = (skill.athleteSkill.updatedAt ?? skill.athleteSkill.createdAt) as any;
                          return d ? new Date(d).toLocaleDateString() : 'Unknown date';
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredSkills.filter(s => s.athleteSkill?.status?.toLowerCase() === 'mastered').length === 0 && (
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 dark:bg-white/10 dark:border-white/20">
                <CardContent className="text-center py-12">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <h3 className="text-lg font-medium text-[#0F0276] dark:text-white mb-2">No achievements yet</h3>
                  <p className="text-[#0F0276]/70 dark:text-white/70">Mastered skills will be celebrated here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Video Modal */}
      <Dialog open={!!openVideo} onOpenChange={(o) => !o && setOpenVideo(null)}>
        <DialogContent className="max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-slate-200/60 dark:border-white/20">
          <DialogHeader>
            <DialogTitle className="text-[#0F0276] dark:text-white flex items-center gap-2">
              <Play className="h-5 w-5 text-[#D8BD2A]" />
              {openVideo?.title || 'Skill Video'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {openVideo?.url && (
              <div className="w-full">
                <AspectRatio ratio={16/9}>
                  <video
                    className="h-full w-full rounded-lg border border-slate-200/60 dark:border-white/20 bg-black shadow-xl"
                    src={openVideo.url}
                    controls
                    playsInline
                    autoPlay
                  />
                </AspectRatio>
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              {openVideo?.url && (
                <a href={openVideo.url} download target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="text-[#0F0276] dark:text-white border-slate-200/60 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Download Video
                  </Button>
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Athlete Modal */}
      {isAdmin && (
        <Dialog open={showEditAthlete} onOpenChange={setShowEditAthlete}>
          <DialogContent className="max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-slate-200/60 dark:border-white/20">
            <DialogHeader>
              <DialogTitle className="text-[#0F0276] dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#D8BD2A]" />
                Edit Athlete: {data.athlete.name || `${data.athlete.firstName || ''} ${data.athlete.lastName || ''}`.trim()}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">Quick Edit Access</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  For comprehensive athlete editing, use the main admin dashboard. This provides quick access to common functions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      window.location.href = '/admin';
                      // You could add a URL parameter to auto-select this athlete
                    }}
                    className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Go to Athletes Tab
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      alert(`Athlete ID: ${data.athlete.id}\nUse this ID to quickly find the athlete in the admin dashboard.`);
                    }}
                    className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Show Athlete ID
                  </Button>
                </div>
              </div>
              
              {/* Quick Info Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#0F0276] dark:text-white">Current Name</Label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                    {data.athlete.name || `${data.athlete.firstName || ''} ${data.athlete.lastName || ''}`.trim() || 'No name set'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0F0276] dark:text-white">Date of Birth</Label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                    {data.athlete.dateOfBirth || 'Not set'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0F0276] dark:text-white">Experience Level</Label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                    {data.athlete.experience || 'Not set'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0F0276] dark:text-white">Total Skills</Label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                    {data.skills.length} skills tracked
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button variant="outline" onClick={() => setShowEditAthlete(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    window.location.href = '/admin';
                    // Close modal
                    setShowEditAthlete(false);
                  }}
                  className="bg-[#0F0276] hover:bg-[#0F0276]/90 text-white"
                >
                  Go to Admin Dashboard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add/Test Skill Dialog */}
      {showAddSkillDialog && (
        <AddAthleteSkillDialog
          open={showAddSkillDialog}
          onOpenChange={(open) => {
            if (!open) setShowAddSkillDialog(false);
          }}
          athleteId={data.athlete.id}
          onPickSkill={(skill) => {
            // Close the add skill dialog and open the test skill dialog
            setShowAddSkillDialog(false);
            setTimeout(() => setTestingSkill({ skill: skill as unknown as SharedSkill }), 250);
          }}
        />
      )}

      {/* Test Skill Dialog */}
      {testingSkill && (
        <TestSkillDialog
          open={!!testingSkill}
          onOpenChange={(open) => !open && setTestingSkill(null)}
          athleteId={data.athlete.id}
          skill={testingSkill.skill}
          existing={{ athleteSkillId: testingSkill.athleteSkillId, status: testingSkill.status, notes: testingSkill.notes }}
        />
      )}
    </div>
  );
}
