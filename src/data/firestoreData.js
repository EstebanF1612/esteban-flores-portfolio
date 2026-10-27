import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function mapSnapshotDoc(snapshotDoc) {
    return {
        id: snapshotDoc.id,
        ...snapshotDoc.data(),
    };
}

export async function fetchCollectionData(collectionName) {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(mapSnapshotDoc);
}

export async function fetchDocumentData(collectionName, documentId) {
    const snapshot = await getDoc(doc(db, collectionName, documentId));

    if (!snapshot.exists()) {
        return null;
    }

    return mapSnapshotDoc(snapshot);
}

export async function setDocumentData(collectionName, documentId, data) {
    await setDoc(doc(db, collectionName, documentId), data);
}

export async function deleteDocumentData(collectionName, documentId) {
    await deleteDoc(doc(db, collectionName, documentId));
}