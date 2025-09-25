import React, {useState, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import {AddChapterHeader, GlobalHeader} from '../../../components';
import {useNavigation} from '@react-navigation/native';

import {Text, Modal as ModalPaper, Portal, useTheme} from 'react-native-paper';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import {Constants} from '../../../common';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ClickYesIcon, Random} from '../../../images';
import {colors} from '../../../common/NewTheme';
const experiences = [
  {
    title: 'Birth',
    description:
      'Share your birth story and any unique circumstances or memorable details.',
  },
  {
    title: 'First Holiday',
    description:
      'Narrate your first memorable holiday experience, including the destination and activities.',
  },
  {
    title: 'First Relationship',
    description:
      'Share stories and lessons from your first romantic relationship.',
  },
  {
    title: 'First Car',
    description:
      'Narrate the experience of buying your first car, including the model and any memorable road trips.',
  },
  {
    title: 'First Time Moving Out',
    description:
      'Share stories and challenges from your first experience moving out of your family home.',
  },
  {
    title: 'Going to College',
    description:
      'Share your experience of entering college, including the decision-making process, expectations, and early experiences.',
  },
  {
    title: 'First Job',
    description:
      'Describe your first job experience, including challenges and lessons learned.',
  },
  {
    title: 'Career Achievements',
    description:
      'Highlight significant milestones and achievements in your professional journey.',
  },
  {
    title: 'Wedding',
    description:
      'Chronicle your wedding day, from the proposal to the ceremony and celebrations.',
  },
  {
    title: "Child's Birth",
    description:
      'Narrate the experience of becoming a parent, including emotions and noteworthy moments.',
  },
  {
    title: 'Retirement',
    description:
      'Reflect on your retirement experience, including plans and newfound freedom.',
  },
  {
    title: 'Encounters',
    description:
      'Narrate unexpected encounters or events that had a profound impact on your life.',
  },
  {
    title: 'First Solo Trip',
    description:
      'Share the story of your first solo travel experience, including the destination and memorable moments.',
  },
  {
    title: 'First Home Purchase',
    description:
      'Narrate the journey of buying your first home, including the process and emotions involved.',
  },
  {
    title: 'First Pet',
    description:
      'Share stories about your first pet, including how you chose them and the bond you shared.',
  },
  {
    title: 'First Business Venture',
    description:
      'Discuss your first entrepreneurial endeavour, sharing challenges and lessons learned.',
  },
  {
    title: 'First Concert or Live Performance',
    description:
      'Recall your first live music or performance experience and the emotions it evoked.',
  },
  {
    title: 'First Extreme Sport or Adventure',
    description:
      'Narrate your first experience with an adrenaline-pumping adventure or extreme sport.',
  },
  {
    title: 'First Big Move',
    description:
      'Share stories about the first time you moved to a new city or country, and how it impacted your life.',
  },
  {
    title: 'First Tech Gadget',
    description:
      'Discuss your first significant technological gadget and its impact on your daily life.',
  },
];

function Milestones({
  openPopUp,
  handleClickCloseMilestone,
  closeMilestone,
  title,
  milestoneValue,
}) {
  const theme = useTheme();
  const {bottom} = useSafeAreaInsets();
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(null);

  const [selectedMilestoneTitle, setSelectedMilestoneTitle] = useState(null);
  const [open, setOpen] = useState(false);
  const flatListRef = useRef(null);

  const selectRandomExperience = () => {
    setSelectedMilestone(null);
    setSelectedMilestoneTitle(null);
    const randomIndex = Math.floor(Math.random() * experiences.length);
    const randomExperience = experiences[randomIndex];

    setSelectedMilestoneIndex(randomIndex);

    scrollToIndex(randomIndex);

    setSelectedMilestone(randomExperience.description);
    setSelectedMilestoneTitle(randomExperience.title);
  };
  useEffect(() => {
    if (selectedMilestone !== null && selectedMilestoneTitle !== null) {
      setTimeout(() => {
        handleClickCloseMilestone(selectedMilestone, selectedMilestoneTitle);
      }, 1000);
    }
  }, [selectedMilestone, selectedMilestoneTitle]);
  const scrollToIndex = index => {
    flatListRef.current.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

  useEffect(() => {
    setOpen(openPopUp);
    setSelectedMilestoneIndex(null);
  }, [openPopUp]);

  function close() {
    setOpen(false);
  }

  function handleBack() {
    closeMilestone();
  }

  console.log(milestoneValue, 'milestoneValue');
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}>
      <Portal>
        <ModalPaper
          visible={open}
          onDismiss={close}
          contentContainerStyle={{
            // height: Constants.Dimension.ScreenHeight(),
            backgroundColor: colors.backgroundCreamy,
            // paddingBottom: bottom,
          }}>
          <View
            style={{
              // height: '100%',
              paddingTop: 90,
              paddingBottom: '55%',
            }}>
            {/* <AddChapterHeader
              onBack={handleBack}
              heading={title}
              backgroundColor="#3CAEE4"
            /> */}
            <GlobalHeader
              heading={'Create Lifestory'}
              onBack={handleBack}
              backgroundColor={colors.backgroundCreamy}
            />
            <View
              style={{
                // backgroundColor: 'white',
                marginHorizontal: 15,
                borderRadius: 10,
                marginBottom: '10%',
              }}>
              <View
                style={{
                  // paddingHorizontal: 20,
                  paddingTop: 15,
                  margin: 0,
                  // backgroundColor: 'white',
                  borderRadius: 10,
                }}>
                <TouchableOpacity
                  style={{
                    width: '100%',
                    padding: 9,
                    marginTop: 0,
                    marginBottom: 15,
                    borderRadius: 10,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderColor: colors.primaryOrange,
                    border: '2px solid',
                    borderWidth: 2,
                  }}
                  onPress={selectRandomExperience}>
                  <Random accessibilityLabel={'Random-Icon'} />
                  <Text
                    style={{
                      margin: 0,
                      color: colors.primaryOrange,
                      paddingLeft: 5,
                    }}
                    accessibilityLabel={'Random-Icon'}>
                    Select Random Prompt
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                ref={flatListRef}
                data={experiences}
                renderItem={({item, index}) => (
                  <TouchableOpacity
                    testID="milestone-prompt"
                    style={{
                      borderBottomWidth: 1,
                      borderColor: '#ABABAB',
                      marginTop: 15,
                      paddingHorizontal: 10,
                      marginRight: 10,
                      backgroundColor:
                        selectedMilestoneIndex === index
                          ? 'white'
                          : 'transparent',
                      borderRadius: selectedMilestoneIndex === index ? 6 : 0,
                      padding: selectedMilestoneIndex === index ? 10 : 0,
                    }}
                    onPress={() => {
                      setSelectedMilestoneIndex(index),
                        handleClickCloseMilestone(item.description, item.title);
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View style={{flex: 0.9}}>
                        <Text
                          style={{
                            fontWeight: '600',
                            margin: 0,
                            color: '#000000',
                            fontSize: 18,
                          }}
                          accessibilityLabel={`${item.title}`}>
                          {item.title}
                        </Text>
                        <Text
                          style={{
                            color: '#000000',
                            fontSize: 14,
                            marginBottom: 15,
                          }}
                          accessibilityLabel={`${item.description}`}>
                          {item.description}
                        </Text>
                      </View>
                      {milestoneValue &&
                        milestoneValue === item.description && (
                          <View style={{flex: 0.1}}>
                            <ClickYesIcon height="25" width="25" />
                          </View>
                        )}
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{paddingBottom: 200}}
              />
            </View>
          </View>
        </ModalPaper>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#FF4F4F',
    zIndex: 100,
  },
  backgroundContainer: {
    height: 200,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  touchableOpacity: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 20,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  tabPanel: {
    flexGrow: 1,
    marginTop: 10,
  },
  prompt: {
    marginTop: 10,
    marginBottom: 10,
    fontWeight: '600',
    color: 'black',
    fontSize: 16,
    paddingHorizontal: 10,
    width: '100%',
  },
  divider: {
    position: 'relative',
    height: 1,
    width: '90%',
    backgroundColor: 'lightgrey',
  },
});

Milestones.propTypes = {
  openPopUp: PropTypes.bool.isRequired,
  handleClickCloseMilestone: PropTypes.func.isRequired,
  closeMilestone: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  milestoneValue: PropTypes.string.isRequired,
};

export default Milestones;
