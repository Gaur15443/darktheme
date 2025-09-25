import {StyleSheet} from 'react-native';
import Theme from '../../common/Theme';

const styles = StyleSheet.create({
  listItem: {
    paddingLeft: '4px',
    color: Theme.dark.scrim,
  },
  listItemOdd: {
    backgroundColor: '#e9e9f9',
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    padding: 8,
    backgroundColor: '#ffff',
    borderWidth: 1,
    borderColor: '#ccc6c6',
    borderRadius: 4,
  },
});

export default styles;
