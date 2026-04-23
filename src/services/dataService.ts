import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { Skill, BrandProfile, Execution } from '../types';

// Users
export async function syncUserProfile(email: string | null, fullName: string, jobTitle: string, profileImage: string, orgId?: string) {
  const user = auth.currentUser;
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  try {
    const userData: any = {
      email: email || user.email || '',
      fullName: fullName || '',
      jobTitle: jobTitle || '',
      profileImage: profileImage || '',
      updatedAt: serverTimestamp()
    };
    
    if (orgId) {
      userData.orgId = orgId;
    }

    await setDoc(userRef, userData, { merge: true });
  } catch (err) {
    console.error('Error syncing user profile:', err);
    handleFirestoreError(err, 'write', `users/${user.uid}`);
  }
}

export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    handleFirestoreError(err, 'get', `users/${user.uid}`);
  }
}

// Skills
export async function saveSkill(skill: Skill, orgId: string) {
  const user = auth.currentUser;
  if (!user) return;
  
  const skillRef = doc(db, 'skills', skill.id);
  try {
    const skillData = {
      ...skill,
      ownerId: user.uid,
      orgId: orgId,
      updatedAt: serverTimestamp(),
      createdAt: skill.createdAt || serverTimestamp()
    };
    await setDoc(skillRef, skillData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', `skills/${skill.id}`);
  }
}

export async function deleteSkill(skillId: string) {
  const skillRef = doc(db, 'skills', skillId);
  try {
    await deleteDoc(skillRef);
  } catch (err) {
    handleFirestoreError(err, 'delete', `skills/${skillId}`);
  }
}

export function subscribeToSkills(orgId: string, callback: (skills: Skill[]) => void) {
  const user = auth.currentUser;
  if (!user || !orgId) return () => {};
  
  const q = query(collection(db, 'skills'), where('orgId', '==', orgId), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const skills = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));
    callback(skills);
  }, (err) => {
    console.error('Skills subscription error:', err);
  });
}

// Brand Profiles
export async function saveBrandProfile(profile: BrandProfile, orgId: string) {
  const user = auth.currentUser;
  if (!user) return;
  
  const profileRef = doc(db, 'brand_profiles', profile.id);
  try {
    await setDoc(profileRef, {
      ...profile,
      ownerId: user.uid,
      orgId: orgId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, 'write', `brand_profiles/${profile.id}`);
  }
}

export async function deleteBrandProfile(id: string) {
  const profileRef = doc(db, 'brand_profiles', id);
  try {
    await deleteDoc(profileRef);
  } catch (err) {
    handleFirestoreError(err, 'delete', `brand_profiles/${id}`);
  }
}

export function subscribeToProfiles(orgId: string, callback: (profiles: BrandProfile[]) => void) {
  const user = auth.currentUser;
  if (!user || !orgId) return () => {};
  
  const q = query(collection(db, 'brand_profiles'), where('orgId', '==', orgId), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const profiles = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BrandProfile));
    callback(profiles);
  }, (err) => {
    console.error('Profiles subscription error:', err);
  });
}

export async function deleteExecution(id: string) {
  const execRef = doc(db, 'executions', id);
  try {
    await deleteDoc(execRef);
  } catch (err) {
    handleFirestoreError(err, 'delete', `executions/${id}`);
  }
}
export async function saveExecution(execution: Execution, orgId: string) {
  const user = auth.currentUser;
  if (!user) return;
  
  const execRef = doc(db, 'executions', execution.id);
  try {
    await setDoc(execRef, {
      ...execution,
      ownerId: user.uid,
      orgId: orgId,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, 'write', `executions/${execution.id}`);
  }
}

export function subscribeToHistory(orgId: string, callback: (history: Execution[]) => void) {
  const user = auth.currentUser;
  if (!user || !orgId) return () => {};
  
  const q = query(collection(db, 'executions'), where('orgId', '==', orgId), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snap) => {
    const history = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Execution));
    callback(history);
  }, (err) => {
    console.error('History subscription error:', err);
  });
}
