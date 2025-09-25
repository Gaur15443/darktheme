import { View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native-paper';
import { DefaultImage } from '../../../components';
import { Theme } from '../../../common';
import FastImage from '@d11/react-native-fast-image';
export default function CollabProfileView({ storyData, imgSize, imgFontSize, fontSize }) {
  const [collaboratingMembers, setCollaboratingMembers] = useState([]);
  useEffect(() => {
    setCollaboratingMembers(storyData?.collaboratingMembers?.slice(0, 2));
  }, [storyData]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ flexDirection: 'row' }}>
        {collaboratingMembers?.map((collab, index) => (
          <View key={index} style={{ position: 'relative', left: 10 }}>
            {/* this below code is for collabs more than 2 */}
            {storyData?.collaboratingMembers?.length > 2 ? (
              <>
                {collab?.collaboratorId?.personalDetails?.profilepic ===
                  null ? (
                  <View
                    style={{
                      transform: [{ translateX: -(10 + index * 10) }],
                    }}>
                    <DefaultImage
                      accesibilityLabel={`collaborator image ${index + 1}`}
                      fontWeight={700}
                      fontSize={imgFontSize || 15}
                      borderRadius={50}
                      height={imgSize || 35}
                      width={imgSize || 35}
                      firstName={collab?.collaboratorId?.personalDetails?.name}
                      lastName={
                        collab?.collaboratorId?.personalDetails?.lastname
                      }
                      gender={collab?.collaboratorId?.personalDetails?.gender}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      transform: [{ translateX: -(10 + index * 10) }],
                    }}>
                    <FastImage
                      accesibilityLabel={`collaborator image ${index + 1}`}
                      source={{
                        uri: collab?.collaboratorId?.personalDetails
                          ?.profilepic,
                      }}
                      style={{
                        height: imgSize || 35,
                        width: imgSize || 35,
                        borderRadius: 50,
                      }}
                    />
                  </View>
                )}
              </>
            ) : (
              // this code is for collabs less than two
              <>
                {collab?.collaboratorId?.personalDetails?.profilepic ===
                  null ? (
                  <View
                    style={{
                      transform: [{ translateX: -(10 + index * 10) }],
                    }}>
                    <DefaultImage
                      accesibilityLabel={`collaborator image ${index + 1}`}
                      fontWeight={700}
                      fontSize={imgFontSize || 15}
                      borderRadius={50}
                      height={imgSize || 35}
                      width={imgSize || 35}
                      firstName={collab?.collaboratorId?.personalDetails?.name}
                      lastName={
                        collab?.collaboratorId?.personalDetails?.lastname
                      }
                      gender={collab?.collaboratorId?.personalDetails?.gender}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      transform: [{ translateX: -(10 + index * 10) }],
                    }}>
                    <FastImage
                      accesibilityLabel={`collaborator image ${index + 1}`}
                      source={{
                        uri: collab?.collaboratorId?.personalDetails
                          ?.profilepic,
                      }}
                      style={{
                        height: imgSize || 35,
                        width: imgSize || 35,
                        borderRadius: 50,
                      }}
                    />
                  </View>
                )}
              </>
            )}
          </View>
        ))}
        {/* this below code is for displaying collabs count */}
        {storyData?.collaboratingMembers?.length > 2 && (
          <View style={{ transform: [{ translateX: -20 }] }}>
            <DefaultImage
              fontWeight={700}
              fontSize={15}
              borderRadius={50}
              height={imgSize || 35}
              width={imgSize || 35}
              firstName={'+'}
              lastName={(
                storyData?.collaboratingMembers?.length - 2
              ).toString()}
              gender={'Female'}
              accesibilityLabel={`collaborator image ${index + 1}`}
            />
          </View>
        )}
      </View>

      {/* below code for collab names  */}
      <Text
        accessibilityLabel="collaborator names"
        style={{
          width: '75%',
          color: Theme.light.pitchBlack,
          fontWeight: 'bold',
          flexShrink: 1,
          flexWrap: 'wrap',
          fontSize: fontSize || 20,
          transform: [
            {
              translateX:
                storyData?.collaboratingMembers?.length === 1
                  ? 0
                  : storyData?.collaboratingMembers?.length > 1 &&
                    storyData?.collaboratingMembers?.length < 3
                    ? -10
                    : -20,
            },
          ],
        }}>
        {storyData?.createdBy?.personalDetails?.name}{' '}
        {storyData?.createdBy?.personalDetails?.lastname}{' '}
        {storyData.collaboratingMembers.length > 1
          ? ', ' +
          `${storyData?.collaboratingMembers?.[0]?.collaboratorId?.personalDetails?.name} ${storyData?.collaboratingMembers?.[0]?.collaboratorId?.personalDetails?.lastname}` +
          ' and ' +
          (storyData?.collaboratingMembers?.length - 1) +
          (storyData?.collaboratingMembers?.length - 1 > 1
            ? ' others'
            : ' other')
          : 'and ' +
          `${storyData?.collaboratingMembers?.[0]?.collaboratorId?.personalDetails?.name} ${storyData?.collaboratingMembers?.[0]?.collaboratorId?.personalDetails?.lastname}`}
      </Text>
    </View>
  );
}
