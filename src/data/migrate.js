import admin from 'firebase-admin';
import { projectData } from './projectData.js';
import { experienceData } from './experienceData.js';
import { skillsData } from './skillsData.js'; 

// Load your service account key (Download from Firebase Console)
import serviceAccount from '../../serviceAccountKey.json' with { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateAllData() {
  console.log("Starting Full Portfolio Migration...");

  // 1. Migrate Skills
  console.log("--- Migrating Skills ---");
  for (const skill of skillsData) {
    try {
      // Uses your existing ID (e.g., 'python', 'unreal-engine') as the Document ID
      await db.collection('skills').doc(skill.id).set(skill);
      console.log(`Skill: ${skill.name}`);
    } catch (e) {
      console.error(`Error with skill ${skill.name}:`, e);
    }
  }

  // 2. Migrate Projects
  console.log("\n--- Migrating Projects ---");
  for (const project of projectData) {
    try {
      await db.collection('projects').doc(project.id).set(project);
      console.log(`Project: ${project.title}`);
    } catch (e) {
      console.error(`Error with project ${project.title}:`, e);
    }
  }

  // 3. Migrate Experience
  console.log("\n--- Migrating Experience ---");
  for (const exp of experienceData) {
    try {
      await db.collection('experience').doc(exp.id).set(exp);
      console.log(`Experience: ${exp.company}`);
    } catch (e) {
      console.error(`Error with experience ${exp.company}:`, e);
    }
  }

  console.log("\n Migration Successful");
  process.exit();
}

migrateAllData();