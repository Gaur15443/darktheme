import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import Axios from '../../../plugin/Axios';
import {Alert} from 'react-native';
import nativeConfig from 'react-native-config';

export const uploadCommunityLogo = createAsyncThunk(
  'uploadCommunityLogo/uploadCommunityLogo',
  async ({userId, communityId, imageFile}) => {
    try {
      const data = await fetch(imageFile.path).then(res => res.blob());
      if (data.size > 5 * 1024 * 1024) {
        Alert.alert('Image size cannot be more than 5 MB');
        return;
      }
      const imageData = {
        uri: imageFile.path,
        name: data?._data?.name,
        type: data?._data?.type,
      };
      const formData = new FormData();
      formData.append('image', imageData);
      formData.append('urlType', 'Image');
      formData.append('imgCategory', 'CommmunityDetail');

      const response = await Axios.post(
        `${nativeConfig.MEDIA_URL}/communityLogo/${userId}/${communityId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

const initialState = {
  communityLogoUrl: null,
  status: 'idle',
  error: null,
};

const uploadCommunityLogoSlice = createSlice({
  name: 'uploadCommunityLogo',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase('LOGOUT', state => {
        Object.assign(state, initialState);
      })
      .addCase(uploadCommunityLogo.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadCommunityLogo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.communityLogoUrl = action.payload.imageUrl;
      })
      .addCase(uploadCommunityLogo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default uploadCommunityLogoSlice.reducer;
