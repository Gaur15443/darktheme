/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { Card, useTheme, Text } from 'react-native-paper';
import { GlobalStyle } from '../../core';
import PieChart from 'react-native-pie-chart';

import Theme from '../../common/Theme';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import NewTheme from '../../common/NewTheme';
import GlobalHeader from '../ProfileTab/GlobalHeader';
import { getFamilyStats, getFamilyStatsGC } from '../../store/apps/familyStats';
import Spinner from '../../common/Spinner';

const { width } = Dimensions.get('window');


const BottomSheetModal = ({ route, generation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const widthAndHeight = 60;
  const data = useSelector(state => state.getFamilyStats || {});
  const GenerationCount = data?.familyStatsGC?.totalGenerationCount;
  const [loadingData, setLoadingData] = useState(false);
  const gendersSeries = [
    data?.familyStats?.final?.FamilyStat?.Status?.members?.genderStatus?.male,
    data?.familyStats?.final?.FamilyStat?.Status?.members?.genderStatus?.female,
  ];

  const statusSeries = [
    data?.familyStats?.final?.FamilyStat?.Status?.members?.aliveStatus?.dead,
    data?.familyStats?.final?.FamilyStat?.Status?.members?.aliveStatus?.alive,
  ];
  const relationShipSeries = [
    data?.familyStats?.final?.FamilyStat?.Status?.members?.marriageStatus
      ?.single,
    data?.familyStats?.final?.FamilyStat?.Status?.members?.marriageStatus
      ?.married,
  ];
  const gendersColor = ['#FF69B4', '#0084FF'];
  const statusColor = ['#48A390', '#414141'];
  const relationShipColor = ['#9900FF', '#93B83D'];
  const [progress, setProgress] = useState({
    living: 0,
    active: 0,
  });

  useEffect(() => {
    if (
      Array.isArray(data.familyStats) ||
      Array.isArray(data.familyStatsGC.length)
    ) {
      async function fetchData() {
        setLoadingData(true);
        const senderId =
          route.params.item?.user?.homePerson?.[0]?.homePerson ||
          route?.params?.item?.senderId;
        const senderFamilyTreeId =
          route.params.item?.tree?.id ||
          route?.params?.item?.senderFamilyTreeId;

        if (senderId && senderFamilyTreeId) {
          try {
            await Promise.all([
              dispatch(getFamilyStats({ senderFamilyTreeId, senderId })),
              dispatch(getFamilyStatsGC({ senderFamilyTreeId, senderId })),
            ]);
          } catch (error) {
          } finally {
            setLoadingData(false);
          }
        }
      }
      fetchData();
    }
  }, [dispatch, route.params]);

  const [tempValue, setTempvalue] = useState(true);

  const onClose = () => {
    setTempvalue(false);
    setTimeout(() => {
      navigation.goBack();
      setTempvalue(true);
    }, 0);
  };

  const totalCount = data?.familyStats?.final?.FamilyStat?.Members?.count;
  const LivingTreeMember =
    data?.familyStats?.final?.FamilyStat?.Members?.treeActiveMember;
  const treeActive =
    data?.familyStats?.final?.FamilyStat?.Members?.treeActiveMember;
  useEffect(() => {
    const calculatedLiving = LivingTreeMember / totalCount;
    const calculatedActive = treeActive / totalCount;
    setProgress({
      living: calculatedLiving,
      active: calculatedActive,
    });
  }, [LivingTreeMember, treeActive, totalCount]);
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View>
        {tempValue && (
          <Animated.View
            entering={SlideInRight}
            exiting={SlideOutRight}
            style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.background },
            ]}>
            <View style={styles.header}>
              <GlobalHeader
                onBack={onClose}
                heading={'Your Family Stats'}
                backgroundColor={NewTheme.colors.backgroundCreamy}
              />
            </View>
            {loadingData ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Spinner />
              </View>
            ) : (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  paddingHorizontal: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 30,
                    width: width - 60,
                  }}>
                  <Card
                    style={{
                      backgroundColor: '#D3E5FF',
                      padding: 15,
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '80px',
                      color: 'black',
                      minHeight: 120,
                    }}>
                    <Text style={styles.totalNo}>{totalCount}</Text>
                    <Text style={styles.totalContent}>Relatives in tree</Text>
                  </Card>
                  <View
                    style={{
                      minWidth: '65%',
                      flex: 1,
                      padding: 10,
                      marginRight: Platform.OS === 'ios' ? 10 : 0,
                    }}>
                    <View
                      style={{
                        marginTop: 5,
                        marginRight: Platform.OS === 'ios' ? 10 : 0,
                      }}>
                      <View style={styles.subheadingWrapper}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: 'black',
                          }}>
                          iMeUsWe members
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: 'black',
                          }}>
                          {LivingTreeMember}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        marginTop: 10,
                        marginRight: Platform.OS === 'ios' ? 10 : 0,
                      }}>
                      <View
                        style={[
                          styles.subheadingWrapper,
                          { backgroundColor: '#D3FFD7' },
                        ]}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: 'black',
                          }}>
                          Generations in tree
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: 'black',
                          }}>
                          {generation || GenerationCount || ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    marginTop: 30,
                    width: width - 60,
                  }}>
                  <Text style={styles.title}>Family stats</Text>

                  <Card style={styles.card}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}>
                      <View style={styles.cardItem}>
                        <Text style={styles.count}>{gendersSeries[1]}</Text>
                        <Text style={[styles.name, { color: gendersColor[0] }]}>
                          Female
                        </Text>
                      </View>
                      <PieChart
                        widthAndHeight={widthAndHeight}
                        series={gendersSeries}
                        sliceColor={['#0084FF', '#FF69B4']}
                        coverRadius={0.7}
                        coverFill={'#FFF'}
                      />
                      <View style={styles.cardItem}>
                        <Text style={styles.count}>{gendersSeries[0]}</Text>
                        <Text style={[styles.name, { color: gendersColor[1] }]}>
                          Male
                        </Text>
                      </View>
                    </View>
                  </Card>

                  <Card style={styles.card}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}>
                      <View style={styles.cardItem}>
                        <Text style={styles.count}>{statusSeries[1]}</Text>
                        <Text style={[styles.name, { color: statusColor[0] }]}>
                          Living
                        </Text>
                      </View>
                      <PieChart
                        widthAndHeight={widthAndHeight}
                        series={statusSeries}
                        sliceColor={['#414141', '#48A390']}
                        coverRadius={0.7}
                        coverFill={'#FFF'}
                      />
                      <View style={styles.cardItem}>
                        <Text style={styles.count}>{statusSeries[0]}</Text>
                        <Text style={[styles.name, { color: statusColor[1] }]}>
                          Deceased
                        </Text>
                      </View>
                    </View>
                  </Card>

                  <Card style={styles.card}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}>
                      <View style={styles.cardItem}>
                        <Text style={styles.count}>
                          {relationShipSeries[1]}
                        </Text>
                        <Text
                          style={[styles.name, { color: relationShipColor[0] }]}>
                          Married
                        </Text>
                      </View>
                      <PieChart
                        widthAndHeight={widthAndHeight}
                        series={relationShipSeries}
                        sliceColor={['#93B83D', '#9900FF']}
                        coverRadius={0.7}
                        coverFill={'#FFF'}
                      />
                      <View style={styles.cardItem}>
                        <Text style={styles.count}>
                          {relationShipSeries[0]}
                        </Text>
                        <Text
                          style={[styles.name, { color: relationShipColor[1] }]}>
                          Single
                        </Text>
                      </View>
                    </View>
                  </Card>
                </View>

                <View
                  style={{
                    marginTop: 30,
                    width: width - 60,
                  }}>
                  <Text style={styles.title}>Blood Group</Text>
                  <ScrollView
                    horizontal
                    style={{
                      paddingVertical: 10,
                    }}>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {data?.familyStats?.final?.FamilyStat?.chartData
                        ?.filter(value => value._id !== 'Unknown')
                        .map(value => (
                          <View
                            style={styles.bloodgroupWrapper}
                            key={value._id}>
                            <Text style={styles.bloodgroup}>{value._id}</Text>
                            <Text style={styles.bloodgroupCount}>
                              {value.count}
                            </Text>
                          </View>
                        ))}
                    </View>
                  </ScrollView>
                </View>
              </ScrollView>
            )}
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Theme.light.background,
    marginTop: Platform.OS === 'ios' ? 70 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    color: Theme.light.shadow,
    marginTop: Platform.OS === 'ios' ? 0 : 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Theme.light.onInfo,
    color: Theme.dark.shadow,
  },
  card: {
    padding: 10,
    marginTop: 10,
    backgroundColor: Theme.light.onInfo,
    color: 'black',
  },
  cardItem: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: 'black',
  },
  text: {
    fontSize: 28,
    color: 'black',
    fontWeight: '700',
  },
  subheadingWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFEDD3',
    padding: 10,
    borderRadius: 10,
  },
  count: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: Theme.dark.shadow,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalNo: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
    color: Theme.dark.shadow,
  },
  totalContent: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.dark.shadow,
  },
  bloodgroupWrapper: {
    width: 70,
    height: 72,
    borderWidth: 3,
    borderColor: '#3473DC',
    borderRadius: 10,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodgroup: {
    fontWeight: '700',
    fontSize: 28,
    color: Theme.dark.shadow,
  },
  bloodgroupCount: {
    fontWeight: '700',
    fontSize: 14,
    color: Theme.dark.shadow,
  },
});

export default BottomSheetModal;
