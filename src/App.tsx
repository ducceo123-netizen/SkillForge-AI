import React, { useState, useEffect } from 'react';
import Shell from './components/layout/Shell';
import Dashboard from './components/dashboard/Dashboard';
import KnowledgeBase from './components/knowledge/KnowledgeBase';
import SkillBuilder from './components/builder/SkillBuilder';
import ExecutionPlayground from './components/playground/ExecutionPlayground';
import HistoryPage from './components/history/HistoryPage';
import SkillsPage from './components/skills/SkillsPage';
import AuthPage from './components/auth/AuthPage';
import ProfilePage from './components/profile/ProfilePage';
import SupportPage from './components/support/SupportPage';
import { Skill, BrandProfile, Execution } from './types';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { 
  subscribeToSkills, 
  subscribeToProfiles, 
  subscribeToHistory, 
  saveSkill, 
  deleteSkill as firebaseDeleteSkill, 
  deleteExecution as firebaseDeleteExecution,
  saveExecution,
  saveBrandProfile,
  deleteBrandProfile,
  getUserProfile,
  syncUserProfile
} from './services/dataService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [history, setHistory] = useState<Execution[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200');
  const [fullName, setFullName] = useState('New User');
  const [jobTitle, setJobTitle] = useState('Editorial Specialist');
  const [orgId, setOrgId] = useState('');

  useEffect(() => {
    let unsubSkills: (() => void) | undefined;
    let unsubProfiles: (() => void) | undefined;
    let unsubHistory: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUserEmail(user.email || '');
          setIsAuthenticated(true);
          
          // Fetch user metadata
          const profile = await getUserProfile();
          let currentOrgId = '';
          
          if (profile) {
            setFullName(profile.fullName || 'New User');
            setJobTitle(profile.jobTitle || 'Editorial Specialist');
            setProfileImage(profile.profileImage || profileImage);
            currentOrgId = profile.orgId;
            
            // Back-fill orgId for existing users who don't have it yet
            if (!currentOrgId) {
              const domain = user.email?.split('@')[1]?.split('.')[0] || 'public';
              currentOrgId = `${domain}-org`;
              await syncUserProfile(user.email || '', profile.fullName || 'New User', profile.jobTitle || 'Editorial Specialist', profile.profileImage || profileImage, currentOrgId);
            }
            setOrgId(currentOrgId);
          } else {
             // Initial sync for new users - use email domain as default orgId
             const domain = user.email?.split('@')[1]?.split('.')[0] || 'public';
             currentOrgId = `${domain}-org`;
             setOrgId(currentOrgId);
             await syncUserProfile(user.email || '', fullName, jobTitle, profileImage, currentOrgId);
             
             // Wait a moment for Firestore to index/propagate for the rules engine
             // (get() in rules can sometimes be sensitive to immediate writes in high-load)
             await new Promise(resolve => setTimeout(resolve, 500));
          }

          // Subscriptions - now passing orgId
          unsubSkills = subscribeToSkills(currentOrgId, setSkills);
          unsubProfiles = subscribeToProfiles(currentOrgId, setProfiles);
          unsubHistory = subscribeToHistory(currentOrgId, setHistory);
        } else {
          setIsAuthenticated(false);
          setUserEmail('');
          // Cleanup subscriptions on logout
          unsubSkills?.();
          unsubProfiles?.();
          unsubHistory?.();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      unsubSkills?.();
      unsubProfiles?.();
      unsubHistory?.();
    };
  }, []);

  const handleRunSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setActiveTab('playground');
  };

  const handleCreateSkill = () => {
    setEditingSkill(null);
    setActiveTab('builder');
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setActiveTab('builder');
  };

  const handleDeleteSkill = async (id: string) => {
    await firebaseDeleteSkill(id);
  };

  const handleSaveSkill = async (skill: Skill) => {
    await saveSkill(skill, orgId);
    setActiveTab('skills');
  };

  const handleAddExecution = async (execution: Execution) => {
    await saveExecution(execution, orgId);
  };

  const handleDeleteExecution = async (id: string) => {
    await firebaseDeleteExecution(id);
  };

  const handleSaveProfile = async (profile: BrandProfile) => {
    await saveBrandProfile(profile, orgId);
  };

  const handleDeleteProfile = async (id: string) => {
    await deleteBrandProfile(id);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const handleUpdateProfileData = async (data: { fullName: string, jobTitle: string, profileImage: string }) => {
    setFullName(data.fullName);
    setJobTitle(data.jobTitle);
    setProfileImage(data.profileImage);
    await syncUserProfile(userEmail, data.fullName, data.jobTitle, data.profileImage);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (activeTab === 'playground' && selectedSkill) {
      return (
        <ExecutionPlayground 
          skill={selectedSkill} 
          profiles={profiles}
          onBack={() => {
            setSelectedSkill(null);
            setActiveTab('dashboard');
          }}
          onSaveExecution={handleAddExecution}
        />
      );
    }

    if (activeTab === 'builder') {
      return (
        <SkillBuilder 
          initialSkill={editingSkill || undefined}
          onSave={handleSaveSkill}
          onCancel={() => setActiveTab('skills')}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            skills={skills}
            history={history}
            onRunSkill={handleRunSkill} 
            onCreateSkill={handleCreateSkill} 
            onNavigateToHistory={() => setActiveTab('history')}
          />
        );
      case 'history':
        return <HistoryPage historyData={history} searchQuery={searchQuery} onDeleteExecution={handleDeleteExecution} />;
      case 'knowledge':
        return (
          <KnowledgeBase 
            profiles={profiles} 
            searchQuery={searchQuery}
            onSaveProfile={handleSaveProfile} 
            onDeleteProfile={handleDeleteProfile} 
          />
        );
      case 'skills':
        return (
          <SkillsPage 
            skills={skills}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRunSkill={handleRunSkill}
            onEditSkill={handleEditSkill}
            onDeleteSkill={handleDeleteSkill}
            onCreateSkill={handleCreateSkill}
          />
        );
      case 'profile':
        return (
          <ProfilePage 
            userEmail={userEmail} 
            profileImage={profileImage}
            fullName={fullName}
            jobTitle={jobTitle}
            onUpdateProfileData={handleUpdateProfileData}
            onLogout={handleLogout} 
          />
        );
      case 'support':
        return <SupportPage />;
      default:
        return (
          <Dashboard 
            skills={skills}
            history={history}
            onRunSkill={handleRunSkill} 
            onCreateSkill={handleCreateSkill} 
            onNavigateToHistory={() => setActiveTab('history')}
          />
        );
    }
  };

  if (!isAuthenticated && !isLoading) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Shell 
      activeTab={activeTab} 
      profileImage={profileImage}
      orgId={orgId}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onTabChange={(tab) => {
        setActiveTab(tab);
        setSelectedSkill(null);
        setEditingSkill(null);
        setSearchQuery(''); // Reset search when switching tabs
      }}
      onCreateAction={handleCreateSkill}
    >
      {renderContent()}
    </Shell>
  );
}
