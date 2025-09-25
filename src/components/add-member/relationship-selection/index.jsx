import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import Spinner from '../../../common/Spinner';
import SisterIcon from '../../../core/icon/sister-icon';
import FatherIcon from '../../../core/icon/father-icon';
import MotherIcon from '../../../core/icon/mother-icon';
import HusbandIcon from '../../../core/icon/husband-icon';
import WifeIcon from '../../../core/icon/wife-icon';
import BrotherIcon from '../../../core/icon/brother-icon';
import SonIcon from '../../../core/icon/son-icon';
import DaughterIcon from '../../../core/icon/daughter-icon';
import BackArrowIcon from '../../../images/Icons/BackArrowIcon';
import {Button} from 'react-native-paper';
import Theme from '../../../common/Theme';
import {useNavigation} from '@react-navigation/native';
import Axios from '../../../plugin/Axios';
import NewTheme from '../../../common/NewTheme';
import HeaderSeparator from '../../../common/HeaderSeparator';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';
export default function RelationShipSelection({
  SelectedRelation,
  userId,
  treeId,
  cLinkDataFromBalkan,
  setfromRelationShipSelection,
}) {
  const navigation = useNavigation();
  const [isRelation, selectRelation] = useState('');
  const [responseData, setResponseData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const onCloseRelationSelection = () => {
    selectRelation('');
    setfromRelationShipSelection(false);
    navigation.goBack();
  };

  const AddMemberForm = () => {
    setfromRelationShipSelection(true);
    SelectedRelation(isRelation);
    setIsLoading(false);
  };
  const {top} = useSafeAreaInsets();
  useEffect(() => {
    getRelationValidator();
    setIsLoading(true);
  }, [userId, treeId]);

  const relationshipData = [
    {name: 'father', icon: <FatherIcon />},
    {name: 'mother', icon: <MotherIcon />},
    {name: 'husband', icon: <HusbandIcon />},
    {name: 'wife', icon: <WifeIcon />},
    {name: 'brother', icon: <BrotherIcon />},
    {name: 'sister', icon: <SisterIcon />},
    {name: 'son', icon: <SonIcon />},
    {name: 'daughter', icon: <DaughterIcon />},
  ];

  const getRelationValidator = async () => {
    setIsLoading(true);
    let finalUserid = userId;
    if (cLinkDataFromBalkan?.isClinkPresent) {
      finalUserid = cLinkDataFromBalkan?.personHasParent
        ? cLinkDataFromBalkan?.personHasParent
        : cLinkDataFromBalkan?.owner;
    }
    const response = await Axios.get(
      `/getRelationValidator/${finalUserid}/${treeId}`,
    );
    if (response?.data) {
      const familyData = relationshipData.map(item => {
        const isDisabled = response?.data?.relation?.[item?.name] === true;
        return {
          ...item,
          isDisabled,
        };
      });
      setResponseData(familyData);
    }
    setIsLoading(false);
  };
  const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  function returnIcon(Icon, isDisabledProp) {
    return <Icon isDisabled={isDisabledProp} />;
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {paddingTop: Platform.OS === 'ios' ? 0 : top},
      ]}>
      <View
        style={[styles.container, {backgroundColor: Theme.light.background}]}>
        {isLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Spinner />
          </View>
        ) : (
          <>
            <View
              style={{
                width: '90%',
                marginHorizontal: 10,
                marginVertical: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                testID="back-click"
                onPress={onCloseRelationSelection}>
                <BackArrowIcon />
              </TouchableOpacity>
              <View style={{alignItems: 'center', paddingLeft: 40}}>
                <Text style={styles.title}>Select Relation</Text>
              </View>
              <TouchableOpacity activeOpacity={1}>
                <Button
                  onPress={AddMemberForm}
                  disabled={isRelation ? false : true}
                  style={{
                    color: 'white',
                    backgroundColor: '#3473DC',
                    borderColor: 'transparent',
                    borderWidth: 0,
                    borderRadius: 8,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: isRelation
                      ? NewTheme.colors.primaryOrange
                      : '#FFC0A1',
                    fontWeight: 700,
                  }}>
                  <Text style={{color: 'white'}}>Next</Text>
                </Button>
              </TouchableOpacity>
            </View>
            <HeaderSeparator />
            <View
              style={{
                marginTop: 20,
                marginLeft: 40,
                marginRight: 40,
                marginBottom: 50,
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
              {responseData.map((relationship, index) => (
                <View
                  key={relationship?.name + index}
                  style={{
                    padding: 10,
                    opacity: !relationship.isDisabled === true ? 1 : 1,
                  }}>
                  <TouchableOpacity
                    key={index}
                    disabled={!relationship.isDisabled}
                    style={[
                      styles.iconContainer,
                      {
                        overflow: 'hidden',
                        backgroundColor: !relationship.isDisabled
                          ? '#d9d7d8'
                          : '#ECECEC',
                        borderColor:
                          isRelation === relationship.name
                            ? Theme.light.primary
                            : 'transparent',
                        borderWidth: isRelation === relationship.name ? 3 : 0,
                      },
                    ]}
                    onPress={() => {
                      selectRelation(relationship.name);
                    }}>
                    <View
                      style={{
                        marginTop:
                          relationship.name === 'son'
                            ? 4
                            : relationship.name === 'wife'
                              ? 8
                              : relationship.name === 'brother'
                                ? 0
                                : 10,
                      }}>
                      {/* {relationship.icon} */}
                      {relationship.icon &&
                        React.cloneElement(relationship.icon, {
                          isDisabled: !relationship.isDisabled,
                        })}
                    </View>
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.relation,

                      {
                        color:
                          isRelation === relationship.name
                            ? Theme.light.primary
                            : Theme.light.shadow,
                        marginTop: 10,
                      },
                      !relationship.isDisabled && {color: 'grey'},
                    ]}>
                    {capitalizeFirstLetter(relationship.name)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    // Padding to account for status bar on Android and iOS
    // SafeAreaView does not automatically account for notch, so set this manually if needed
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  container: {
    // flex: 1,
    height: '100%',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 5 : 0,
  },
  rowContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginLeft: 30,
    marginRight: 40,
  },

  backButtonText: {
    fontSize: 18,
    color: '#3473DC',
  },
  relation: {
    textAlign: 'center',
    justifyContent: 'center',
    // marginTop:10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',

    color: Theme.light.shadow,
  },

  nextButtonText: {
    fontSize: 18,
    color: '#3473DC',
  },
  relationShipContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    // alignItems: 'center',
    // flexWrap: 'wrap',
  },
  relationShipContent: {
    alignItems: 'center',
    // margin: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECECEC',
    borderRadius: 50,
    // marginTop: -20,
    // borderWidth: 2,
    // borderColor: 'red',
  },
  disabled: {
    opacity: 0.5,
  },
});
