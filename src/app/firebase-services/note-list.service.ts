import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { DocumentData, Firestore, addDoc, collection, collectionData, doc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  unsubTrash;
  unsubNotes;

  firestore: Firestore = inject(Firestore);


  constructor() {
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
  }

  subTrashList() {
    this.trashNotes = [];
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach((element) => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList() {
    this.normalNotes = [];
    return onSnapshot(this.getNotesRef(), (list) => {
      this.normalNotes = [];
      list.forEach((element) => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  ngOnDestroy() {
    this.unsubNotes();
    this.unsubTrash();
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

  async addNote(item: Note) {
    await addDoc(this.getNotesRef(), item).catch((error) => {
      console.log("Error adding document: ", error);

    }).then((docRef) => {
      console.log('Document written with ID: ', docRef?.id);

    });
  }

  async updateNote(colId: string, docId: string, item: {}) {
    await updateDoc(this.getSingleDocRef(colId, docId), item).catch((error) => {
      console.log("Error updating document: ", error);
    }).then((docRef) => {
      console.log('Document updated with ID: ', docRef);
    })
  }
} 
