import {toSentenceCase} from '../../../utils/format';
import {CrossIcon} from '../../../images';
import {RootState} from '../../../store';
import {memo, useCallback, useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  ViewStyle,
} from 'react-native';
import {Text, useTheme, Button} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {AstroFilterKey} from '../../../store/apps/astroFilters/index.d';
import {SvgXml} from 'react-native-svg';
import CustomRadio from '../../../components/ProfileTab/CustomRadio';

type FilterSortProps = {
  onClose: () => void;
  selectedSkills: string[];
  selectedLanguage: string[];
  selectedGender: string[];
  selectedSortBy: string | null;
  onApply?: (data: any) => void;
  onClear?: () => void;
  handleSkillCheck?: (skill: string) => void;
  handleLanguageSelect?: (lang: string) => void;
  handleGenderSelect?: (gender: string) => void;
  handleSortBySelect?: (sortBy: string | null) => void;
  applyingFilter?: boolean;
};

const CTAS_CONTAINER_HEIGHT = 54;

type CustomCheckBoxProps = {
  color?: string;
  check?: boolean;
  onCheck?: () => void;
  checkBoxKey?: string | number;
  style?: ViewStyle;
};

const TICK_SVG_STRING = `<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.5 1.625L4.3125 7.8125L1.5 5" stroke="#6944D3" stroke-width="1.6666" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const TickIcon = memo(() => (
  <SvgXml xml={TICK_SVG_STRING} width={15} height={15} />
));

const CustomCheckBox = memo(function CustomCheckBox({
  color = '#000',
  check = false,
  onCheck = () => undefined,
  checkBoxKey,
  style,
  ...props
}: CustomCheckBoxProps) {
  const baseStyle: ViewStyle = useMemo(
    () => ({
      backgroundColor: '#fff',
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 3,
      borderColor: color,
      borderWidth: 1.5,
      ...style,
    }),
    [color, style],
  );

  const handlePress = useCallback(() => {
    onCheck();
  }, [onCheck]);

  return (
    <View key={checkBoxKey}>
      <TouchableOpacity
        {...props}
        testID={check ? 'customCheckBoxActive' : 'customCheckBoxDisabled'}
        onPress={handlePress}
        style={baseStyle}>
        {check && <TickIcon />}
      </TouchableOpacity>
    </View>
  );
});

const FilterTab = memo(
  ({
    filterTabKey,
    isActive,
    label,
    onPress,
    textStyle,
  }: {
    filterTabKey: string;
    isActive: boolean;
    label: string;
    onPress: () => void;
    textStyle: any;
  }) => (
    <TouchableOpacity
      key={filterTabKey}
      onPress={onPress}
      style={[styles.filterTab, isActive && styles.activeFilter]}>
      <Text variant={'bold' as any} style={textStyle}>
        {label}
      </Text>
    </TouchableOpacity>
  ),
);

const CheckboxItem = memo(
  ({
    item,
    isSelected,
    onCheck,
    theme,
  }: {
    item: string;
    isSelected: boolean;
    onCheck: () => void;
    theme: any;
  }) => {
    const [localChecked, setLocalChecked] = useState(isSelected);

    useEffect(() => {
      setLocalChecked(isSelected);
    }, [isSelected]);

    const handleCheck = useCallback(() => {
      setLocalChecked(prev => !prev);
      onCheck();
    }, [onCheck]);

    return (
      <TouchableOpacity
        key={`checkbox-${item}`}
        style={styles.optionRow}
        onPress={handleCheck}
        activeOpacity={0.7}>
        <View style={styles.checkRow}>
          <CustomCheckBox
            style={styles.checkBox}
            color={theme.colors.primary}
            check={localChecked}
            onCheck={handleCheck}
          />
          <Text>{item}</Text>
        </View>
      </TouchableOpacity>
    );
  },
);

const RadioItem = memo(
  ({
    item,
    isChecked,
    onPress,
  }: {
    item: any;
    isChecked: boolean;
    onPress: () => void;
  }) => {
    const itemKey = typeof item === 'object' && 'key' in item ? item.key : item;
    const itemValue =
      typeof item === 'object' && 'value' in item ? item.value : item;

    return (
      <View key={`radio-${itemKey}`} style={styles.optionRow}>
        <CustomRadio label={itemValue} checked={isChecked} onPress={onPress} />
      </View>
    );
  },
);

const FilterSort = memo(
  ({
    onClose,
    selectedSkills,
    selectedLanguage,
    selectedGender,
    selectedSortBy,
    onApply = () => null,
    onClear = () => null,
    handleSkillCheck = () => null,
    handleLanguageSelect = () => null,
    handleGenderSelect = () => null,
    handleSortBySelect = () => null,
    applyingFilter = false,
  }: FilterSortProps) => {
    const filterOptions = useSelector(
      (state: RootState) => state.astroFilters.filterOptions,
    );
    const [activeFilter, setActiveFilter] = useState('skills');
    const theme = useTheme();

    const filteredFilterOptions = useMemo(() => {
      if (!filterOptions) return [];

      return Object.keys(filterOptions).filter(
        key =>
          (filterOptions as Record<string, any>)[key].type !== 'tab' &&
          (filterOptions as Record<string, any>)[key].type !== 'dropdown',
      );
    }, [filterOptions]);

    const currentFilterData = useMemo(() => {
      return filterOptions?.[activeFilter as AstroFilterKey];
    }, [filterOptions, activeFilter]);

    const isItemSelected = useCallback(
      (item: string) => {
        if (activeFilter === 'skills') {
          return selectedSkills?.includes?.(item);
        } else if (activeFilter === 'languages') {
          return selectedLanguage?.includes?.(item);
        } else if (activeFilter === 'gender') {
          return selectedGender?.includes?.(item);
        }
        return false;
      },
      [activeFilter, selectedSkills, selectedLanguage, selectedGender],
    );

    const onCheckItem = useCallback(
      (item: string) => {
        if (activeFilter === 'skills') {
          handleSkillCheck(item);
        } else if (activeFilter === 'languages') {
          handleLanguageSelect(item);
        } else if (activeFilter === 'gender') {
          handleGenderSelect(item);
        }
      },
      [
        activeFilter,
        handleSkillCheck,
        handleLanguageSelect,
        handleGenderSelect,
      ],
    );

    const applyData = useMemo(
      () => ({
        skills: selectedSkills,
        language: selectedLanguage,
        gender: selectedGender,
        sortBy: selectedSortBy,
      }),
      [selectedSkills, selectedLanguage, selectedGender, selectedSortBy],
    );

    const headerStyle = useMemo(
      () => ({
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        paddingBottom: 4,
      }),
      [],
    );

    const getFilterTabTextStyle = useCallback(
      (isActive: boolean) => ({
        color: isActive ? theme.colors.primary : '#fff',
      }),
      [theme.colors.primary],
    );

    const filterTabLabels = useMemo(() => {
      return filteredFilterOptions.map(key => ({
        key,
        label: toSentenceCase(
          key
            .replace(/skills/i, 'skill')
            .replace(/languages/i, 'language')
            .replace(/sortlist/i, 'sort by'),
        ),
        isActive: activeFilter === key,
      }));
    }, [filteredFilterOptions, activeFilter]);

    const checkboxItems = useMemo(() => {
      if (currentFilterData?.type !== 'checkbox' || !currentFilterData?.data) {
        return [];
      }

      return currentFilterData.data.map((item: any) => ({
        item: item as string,
        isSelected: isItemSelected(item as string),
        onCheck: () => onCheckItem(item as string),
      }));
    }, [currentFilterData, isItemSelected, onCheckItem]);

    const radioItems = useMemo(() => {
      if (currentFilterData?.type !== 'radio' || !currentFilterData?.data) {
        return [];
      }

      return currentFilterData.data.map((item: any) => {
        const itemKey =
          typeof item === 'object' && 'key' in item ? item.key : item;
        const isChecked =
          typeof item === 'object' && 'key' in item
            ? selectedSortBy === item.key
            : selectedSortBy === item;

        return {
          item,
          isChecked,
          onPress: () => handleSortBySelect(itemKey),
        };
      });
    }, [currentFilterData, selectedSortBy, handleSortBySelect]);

    const buttonsContainerStyle = useMemo(
      () => [styles.buttonsContainer, {height: CTAS_CONTAINER_HEIGHT}],
      [],
    );

    const scrollViewContentStyle = useMemo(
      () => ({
        paddingBottom: 20,
      }),
      [],
    );

    return (
      <View style={{flex: 1}}>
        <View style={headerStyle}>
          <Text variant={'bold' as any} style={styles.title}>
            Filter & Sort
          </Text>
          <TouchableOpacity onPress={onClose}>
            <CrossIcon testID={'close-filter-icon'} />
          </TouchableOpacity>
        </View>
        <View style={styles.filterBody}>
          <View style={styles.filterLeft}>
            {filterTabLabels.map(({key, label, isActive}) => (
              <FilterTab
                filterTabKey={key}
                isActive={isActive}
                label={label}
                onPress={() => setActiveFilter(key)}
                textStyle={getFilterTabTextStyle(isActive)}
              />
            ))}
          </View>
          <View style={styles.filterRight}>
            <ScrollView
              contentContainerStyle={scrollViewContentStyle}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {checkboxItems.map(({item, isSelected, onCheck}) => (
                <CheckboxItem
                  key={`checkbox-${item}`}
                  item={item}
                  isSelected={isSelected}
                  onCheck={onCheck}
                  theme={theme}
                />
              ))}
              {radioItems.map(({item, isChecked, onPress}) => (
                <RadioItem
                  key={`radio-${typeof item === 'object' && 'key' in item ? item.key : item}`}
                  item={item}
                  isChecked={isChecked}
                  onPress={onPress}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={buttonsContainerStyle}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  borderWidth: 1,
                  borderColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
              onPress={onClear}>
              <Text variant={'bold' as any} style={{textAlign: 'center'}}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <Button
              loading={applyingFilter}
              disabled={applyingFilter}
              mode="contained"
              style={styles.button}
              onPress={() => onApply(applyData)}>
              Apply
            </Button>
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  filterBody: {
    flexDirection: 'row',
    flex: 1,
    borderTopWidth: 1,
    borderColor: '#FFFFFF',
  },
  activeFilter: {
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterLeft: {
    width: '40%',
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
  },
  filterRight: {
    width: '60%',
    paddingLeft: 10,
  },
  filterTab: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF0D',
    paddingLeft: 12,
  },
  optionRow: {
    marginVertical: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    width: '100%',
  },
  checkBox: {
    borderRadius: 4,
    marginRight: 10,
    overflow: 'hidden',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    marginHorizontal: 5,
    height: 40,
    flex: 1,
    borderRadius: 6,
  },
});

export default FilterSort;
