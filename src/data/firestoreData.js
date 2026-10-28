import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const collectionCache = new Map();
const collectionRequests = new Map();

function mapSnapshotDoc(snapshotDoc) {
    return {
        id: snapshotDoc.id,
        ...snapshotDoc.data(),
    };
}

export async function fetchCollectionData(collectionName) {
    if (collectionCache.has(collectionName)) {
        return collectionCache.get(collectionName);
    }

    if (!collectionRequests.has(collectionName)) {
        const request = getDocs(collection(db, collectionName))
            .then((snapshot) => {
                const data = snapshot.docs.map(mapSnapshotDoc);
                collectionCache.set(collectionName, data);
                return data;
            })
            .finally(() => {
                collectionRequests.delete(collectionName);
            });

        collectionRequests.set(collectionName, request);
    }

    return collectionRequests.get(collectionName);
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
    collectionCache.delete(collectionName);
}

export async function deleteDocumentData(collectionName, documentId) {
    await deleteDoc(doc(db, collectionName, documentId));
    collectionCache.delete(collectionName);
}