import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, addDoc, collection, doc, onSnapshot, updateDoc, deleteDoc, query, where, limit } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  unsubTrash;
  unsubNotes;
  unsubMarkedNodes;

  firestore: Firestore = inject(Firestore);


  constructor() {
    this.unsubMarkedNodes = this.subMarkedNodesList();
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
    
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach((element) => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList() {
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach((element) => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subMarkedNodesList() {
    const q = query(this.getNotesRef(), where('marked', '==', true));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach((element) => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  ngOnDestroy() {
    this.unsubNotes();
    this.unsubTrash();
    this.unsubMarkedNodes();
  }


  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id || '',
      type: obj.type || 'note',
      title: obj.title || '',
      content: obj.content || '',
      marked: obj.marked || false
    }
  }

  async addNote(item: Note, colId: 'notes' | 'trash') {
    let docRef;
    if (colId == 'trash') {
      docRef = this.getTrashRef();
    } else if (colId == 'notes') {
      docRef = this.getNotesRef();
    }
    if (docRef)
      await addDoc(docRef, item).catch((error) => {
        console.log("Error adding document: ", error);
      }).then((docRef) => {
        console.log('Document written with ID: ', docRef?.id);
      });
  }

  getColIdFromNote(note: Note) {
    return note.type == 'note' ? 'notes' : 'trash';
  }

  getCleanJSON(note: Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked
    }
  }

  async updateNote(note: Note) {
    if (note && note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJSON(note)).catch((error) => {
        console.log("Error updating document: ", error);
      }).then((docRef) => {
        console.log('Document updated with ID: ', docRef);
      });
    }
  }

  async deleteNote(colId: 'notes' | 'trash', docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((error) => {
      console.log("Error deleting document: ", error);
    });
  }
} 
