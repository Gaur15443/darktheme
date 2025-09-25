import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import CustomButton from '../../core/UICompoonent/CustomButton';
import NewTheme from '../../common/NewTheme';
import ErrorBoundary from '../../common/ErrorBoundary';

const Firsttime = () => {
  const navigation = useNavigation();
  const OwnerFamily = useSelector(state => state?.Tree?.AllFamilyTrees);
  let FamilyName = OwnerFamily?.ownFamilyName;
  const createTree = () => {
    navigation.navigate('Trees', {iscreateTree: true});
  };

  return (
    <ErrorBoundary>
      <View accessibilityLabel="home-firsttime" style={styles.wrapper}>
        <Card style={styles.card}>
          <View
            style={{
              //paddingBottom: 6,
              borderRadius: 8,
              paddingHorizontal: 18,
              height: 'auto',
              backgroundColor: NewTheme.colors.whiteText,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: NewTheme.colors.blackText,
                marginTop: 8,
                textTransform: 'capitalize',
              }}>
              {(() => {
                if (FamilyName) {
                  if (!FamilyName.toLowerCase().includes('family')) {
                    FamilyName += ' Family';
                  }
                  if (FamilyName.length > 15) {
                    return FamilyName.slice(0, 15) + '...';
                  }
                  return FamilyName;
                }
                return null;
              })()}
            </Text>
            <Text
              style={{
                color: NewTheme.colors.secondaryLightBlue,
                fontWeight: '700',
                fontSize: 15,
                opacity: 0.8,
                textTransform: 'capitalize',
              }}>
              Owner
            </Text>
            <View style={{flexDirection: 'row', justifyContent: ''}}>
              <CustomButton
                accessibilityLabel="CreateTree"
                label={'Create Tree'}
                style={styles.buttonOne}
                onPress={() => {
                  createTree();
                }}
              />
            </View>
          </View>
        </Card>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 3,
    paddingBottom: 5,
    paddingTop: 4,
  },
  card: {
    width: 250,
    marginRight: 6,

    borderRadius: 8,
  },
  buttonOne: {
    backgroundColor: NewTheme.colors.primaryOrange,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 12,
  },
});

export default memo(Firsttime);
