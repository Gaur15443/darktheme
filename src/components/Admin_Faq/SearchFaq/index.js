import {React} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import SearchIcon from '../../../images/Icons/SearchIcon';
import NewTheme from '../../../common/NewTheme';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {CustomInput} from '../../../components';

function SearchFaq({onSearch, setFocus}) {
  const handleChange = text => {
    onSearch(text);
  };
  const handleChangeScreen = () => {
    setFocus(true);
  };

  return (
    <ErrorBoundary>
      <View style={{alignSelf: 'center', width: '90%', marginTop: -25}}>
        <CustomInput
          style={styles.textInput}
          label="Search"
          customLabelStyle={{color: '#E77237'}}
          onChangeText={handleChange}
          contentStyle={{width: '100%'}}
          inputHeight={50.9}
          left={<SearchIcon />}
          customBorderColor={NewTheme.colors.primaryOrange}
          onFocus={handleChangeScreen}
          centerNumber={3.1}
        />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: NewTheme.colors.primaryOrange,
    borderRadius: Platform.OS === 'ios' ? 8 : 12,
    padding: 2,
    marginTop: -25,
    width: '90%',
    backgroundColor: NewTheme.colors.backgroundWhite,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchIcon: {
    marginLeft: 10,
  },
  textInput: {
    marginLeft: 6,
    flex: 1,
    fontSize: 16,
    color: NewTheme.colors.blackText,
  },
});

export default SearchFaq;
