/*
1. Import: Import the ImuwTooltip and TooltipStep components from @core into your file where you want to use the tooltip.

import { ImuwTooltip, TooltipStep } from '@core';

2. Create a state variable to manage the current order of the tooltip steps.This state will be used to control the visibility and order of tooltip steps.
const [currentOrder, setCurrentOrder] = useState(1);

3. Usage:
- Wrap the elements you want to attach tooltips to within the ImuwTooltip component.
- Use the tooltipParam prop to specify the screen name to get specific steps of the tooltip.
- Pass the currentOrder state variable and the setCurrentOrder function as props to ImuwTooltip.
- Wrap each element with a tooltip in a TooltipStep component. Use the order prop to specify the sequence in which the tooltips should appear.

4 Example :
import React, { useState } from 'react';
import { ImuwTooltip, TooltipStep } from '@core';
import { Button } from 'react-native';

const App = () => {
  const [currentOrder, setCurrentOrder] = useState(1);

  return (
    <ImuwTooltip
      tooltipParam="account"
      currentOrder={currentOrder}
      setCurrentOrder={setCurrentOrder}
    >
      <TooltipStep order={2}>
        <Button title="Press It" />
      </TooltipStep>
    </ImuwTooltip>

    <ImuwTooltip
      tooltipParam="account"
      currentOrder={currentOrder}
      setCurrentOrder={setCurrentOrder}
    >
      <TooltipStep order={1}>
        <Text>Hello</Text>
      </TooltipStep>
    </ImuwTooltip>
  );
};

export default MyScreen;

*/

import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import Axios from '../../plugin/Axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {setHomeTooltipSeen} from '../../store/apps/tree';
import {useDispatch} from 'react-redux';

export const TooltipStep = ({children, order}) => <>{children}</>;

export const ImuwTooltip = ({
  tooltipParam,
  children,
  currentOrder,
  setCurrentOrder,
  backgroundColor = '#fff',
}) => {
  // States
  const [tooltipData, setTooltipData] = useState(null);
  const [currentStep, setcurrentStep] = useState(0);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [hasSeenTooltip, setHasSeenTooltip] = useState(false);
  const [tempClose, setTempClose] = useState(null);
  const userInfo = useSelector(state => state.userInfo);
  const userId = useSelector(state => state.userInfo?._id);
  const dispatch = useDispatch();
  useEffect(() => {
    if (
      userInfo?.personalDetails?.name &&
      userInfo?.personalDetails?.gender &&
      userInfo?.personalDetails?.lastname
    ) {
      setIsSignedUp(true);
    }
  }, [userInfo]);
  // UseEffect Hook To Check User Has Seen The Tooltip Or Not
  useEffect(() => {
    const checkSeenTooltip = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem(
          `hasSeenTooltip_${tooltipParam}`,
        );
        if (hasSeen) {
          setHasSeenTooltip(true);
        }
      } catch (error) {
        console.error('Error retrieving tooltip status from storage:', error);
      }
    };
    checkSeenTooltip();
  }, [tooltipParam]),
    // UseEffect Hook To Get Tooltip Data From The Server
    useFocusEffect(
      React.useCallback(() => {
        const getTooltips = async params => {
          try {
            const res = await Axios.get('/tooltips');
            const {story, tree, account, homePage} = res?.data || {};
            switch (params) {
              case 'story':
                setTooltipData(story?.steps);
                break;
              case 'tree':
                setTooltipData(filterTreeTooltips(tree));
                break;
              case 'account':
                setTooltipData(account?.steps);
                break;
              case 'homePage':
                setTooltipData(homePage?.steps);
                break;
              default:
                setTooltipData(null);
            }
          } catch (error) {
            console.error('Error fetching tooltips:', error);
          }
        };
        if (!tooltipData && isSignedUp) {
          getTooltips(tooltipParam);
        }
      }, [tooltipParam, hasSeenTooltip, isSignedUp]),
    );

  // Filter Tree Tooltips
  const filterTreeTooltips = treeTooltips => {
    if (!treeTooltips) {return null;}

    const filteredSteps = treeTooltips.steps.filter(
      step => step.element !== '#treeTab',
    );
    return {
      ...treeTooltips,
      steps: filteredSteps,
    };
  };

  // Go To Next Tooltip
  const handleNextTooltip = () => {
    if (!hasSeenTooltip) {
      if (currentOrder < tooltipData.length) {
        setCurrentOrder(currentOrder + 1);
      } else {
        setCurrentOrder(1);
      }
    }
  };

  // UseEffect to increment current tooltip data step
  useEffect(() => {
    if (!hasSeenTooltip) {
      if (tooltipData) {
        if (currentStep < tooltipData.length - 1) {
          setcurrentStep(currentStep + 1);
        } else {
          setcurrentStep(0);
        }
      }
    }
  }, [currentOrder]);

  // Close Tooltip Functionality
  const closeTooltip = async () => {
    try {
      await AsyncStorage.setItem(`hasSeenTooltip_${tooltipParam}`, 'true');
      setHasSeenTooltip(true);
      if (tooltipParam === 'homePage') {
        dispatch(setHomeTooltipSeen(true));
      }
    } catch (error) {
      console.error('Error saving tooltip status:', error);
    }
  };

  return React.Children.map(children, (child, index) => {
    const orderIndex = child.props.order;
    const isVisible = orderIndex === currentOrder && !hasSeenTooltip;

    return (
      tooltipData && (
        <Tooltip
          key={index}
          isVisible={isVisible}
          showChildInTooltip={true}
          content={
            <View
              style={{
                position: 'relative',
                flexDirection: 'row',
                padding: 0,
              }}>
              <View style={{flex: 1}}>
                <Text
                  style={{textAlign: 'center', color: 'black', fontSize: 14}}>
                  {tooltipData[currentStep]?.intro.replace(/<\/?strong>/g, '')}
                </Text>
              </View>

              <View
                style={{
                  marginLeft: 4,
                  marginBottom: 2,
                  width: 12,
                }}>
                <TouchableOpacity
                  testID="closeTooltipBtn"
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: 3,
                    marginRight: -5,
                  }}
                  onPress={closeTooltip}>
                  <Icon name="close" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          }
          tooltipStyle={{width: 200, height: 'auto'}}
          placement={
            tooltipParam !== 'story'
              ? tooltipParam !== 'homePage'
                ? tooltipData[currentStep]?.position
                : 'top'
              : 'bottom'
          }
          onClose={closeTooltip}>
          <View
            style={{
              backgroundColor: backgroundColor || theme.colors.onBackground,
              width: '100%',
              borderRadius: 8,
            }}>
            {child.props.children}
          </View>
        </Tooltip>
      )
    );
  });
};

const styles = StyleSheet.create({
  tooltip: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  tooltipArrow: {
    borderTopColor: '#fff',
  },
});
