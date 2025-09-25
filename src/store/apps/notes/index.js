import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';

export const publishNote = createAsyncThunk(
  'notes/publishNote',
  async ({userId, noteData, clinkowner}) => {
    
    const response = await Axios.post(`/post-new-note/${userId}${clinkowner ? `?cLinkOwner=${clinkowner}` : ''}`, noteData);
    return response.data;
  },
);

export const fetchAllNotes = createAsyncThunk(
  'notes/fetchAllNotes',
  async (userId) => {
    const response = await Axios.get(`/get-notes/${userId}`);
    return response.data;
  },
);

export const fetchNoteById = createAsyncThunk(
  'notes/fetchNoteById',
  async ({userId, noteId}) => {
    const response = await Axios.get(`/get-note-by-id/${noteId}`);
    return response.data;
  },
);

const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    allNotes: [],
    noteById: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(fetchAllNotes.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(fetchAllNotes.fulfilled, (state, action) => {
            state.status = 'succeeded';            
            state.allNotes = action.payload;
        })
        .addCase(fetchAllNotes.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message;
        })

        // Fetch notes by ID
        .addCase(fetchNoteById.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(fetchNoteById.fulfilled, (state, action) => {
            state.status = 'succeeded';            
            state.noteById = action.payload;
        })
        .addCase(fetchNoteById.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message;
        });
  },
});

export default notesSlice.reducer;