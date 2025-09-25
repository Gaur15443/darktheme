import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {Text} from 'react-native-paper';
import FaqHomeIcon from '../../../images/Icons/FaqHomeIcon';
import SearchFaq from '../../../components/Admin_Faq/SearchFaq';
import SubcategoryIcon from '../../../images/Icons/SubcategoryIcon';
import DropdownIcon from '../../../images/Icons/DropDownIcon';
import {GlobalHeader} from '../../../components';
import SupportIcon from '../../../images/Icons/SupportIcon';
import TutorialVideos from '../../../components/Admin_Faq/TutorialVideos';
import Spinner from '../../../common/Spinner';
import {Theme} from '../../../common';
import newTheme from '../../../common/NewTheme';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchCategories,
  fetchArticles,
  fetchSearchResults,
} from '../../../store/apps/Faq';
import ErrorBoundary from '../../../common/ErrorBoundary';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

function FaqHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [extractedSearchTitle, setExtractedSearchTitle] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [focus, setFocus] = useState(false);
  const categories = useSelector(state => state?.Faq?.categories?.data);
  const articles = useSelector(state => state?.Faq?.searchArticles);
  const [apiResponse, setApiResponse] = useState([]);
  const [hasFetchedCategories, setHasFetchedCategories] = useState(false);
  const {bottom }=useSafeAreaInsets()
  const handleBack = () => {
    if (focus) {
      setFocus(false);
    } else {
      navigation.goBack();
    }
  };

  const GotoFeedback = () => {
    navigation.navigate('Feedback');
  };

  const handleSearch = async query => {
    try {
      setSearchQuery(query);
      if (!query.trim()) {
        setApiResponse([]);
        return;
      }

      const res = await dispatch(fetchSearchResults(query)).unwrap();
      const filteredArticles = res.articles.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()),
      );
      setApiResponse(filteredArticles);
    } catch (error) {
      Toast.error(error);
    }
  };

  useEffect(() => {
    if (apiResponse?.length > 0) {
      const extractedTitles = apiResponse.map(item => item.title);
      setExtractedSearchTitle(extractedTitles);
    }
  }, [apiResponse]);

  const handleArticleClick = article => {
    if (article?.subcategoryTitle && article?.subcategoryTitle?.length > 0) {
      navigation.navigate('SubcategoryScreen', {
        subcategory: article?.subcategoryTitle,
        categoryTitle: article?.categoryTitle,
        subcategoryId: article?.subcategory,
        articleId: article?._id,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'No subcategories found for this article.',
      });
    }
  };

  useEffect(() => {
    const fetchCategory = async () => {
    if (!hasFetchedCategories && (!categories || categories.length === 0)) {
      setLoading(true);
      try {
        await dispatch(fetchCategories()).unwrap();
          setHasFetchedCategories(true);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: error,
        });
      } finally {
        setLoading(false);
      }
      }
    };
    fetchCategory();
  }, [dispatch, categories, hasFetchedCategories]);

  const handleCategoryPress = category => {
    if (selectedCategory === category) {
      setDropdownVisible(!dropdownVisible);
    } else {
      setSelectedCategory(category);
      setDropdownVisible(true);
    }
  };

  const getSubcategories = category => {
    const categoryData = categories.find(cat => cat._id === category._id);
    return categoryData ? categoryData.subcategories : [];
  };

  const subcategories = selectedCategory
    ? getSubcategories(selectedCategory)
    : [];

  const handleSubcategoryPress = async subcategory => {
    setLoading(true);
    try {
      // await dispatch(fetchArticles(subcategory?._id)).unwrap();
      navigation.navigate('SubcategoryScreen', {
        subcategory: subcategory?.title,
        categoryTitle: selectedCategory?.title,
        subcategoryId: subcategory?._id,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
      });
    } finally {
      setLoading(false);
    }
  };

  // const filteredCategories = categories.filter(category =>
  //   category.title.toLowerCase().includes(searchQuery.toLowerCase()),
  // );

  if (!hasFetchedCategories && loading) {
    return (
      <View style={styles.categoryContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary.Screen>
      <GlobalHeader
        accessibilityLabel="goBackfromFaq"
        onBack={handleBack}
        heading={'FAQs'}
        backgroundColor={Theme.light.background}
        fontSize={20}
      />
      {!focus ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <FaqHomeIcon style={styles.faqIcon} />
          <SearchFaq setFocus={setFocus} />
          <View style={styles.categoryContainer}>
            {categories?.length > 0 ? (
              categories?.map?.(category => (
                <View key={category._id} style={styles.underLine}>
                  <TouchableOpacity
                    style={styles.categoryButton}
                    onPress={() => handleCategoryPress(category)}>
                    <Text style={styles.categoryText}>
                      {truncateText(category?.title, 25)}
                    </Text>
                    <DropdownIcon
                      style={[
                        styles.icon,
                        {
                          transform: [
                            {
                              rotate:
                                selectedCategory?._id === category._id &&
                                dropdownVisible
                                  ? '180deg'
                                  : '0deg',
                            },
                          ],
                        },
                      ]}
                      width={20}
                      height={20}
                    />
                  </TouchableOpacity>

                  {selectedCategory?._id === category._id &&
                    dropdownVisible && (
                      <View style={styles.dropdownContainer}>
                        {subcategories.length > 0 ? (
                          <ScrollView
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            style={styles.dropdownList}>
                            {subcategories.map(subcategory => (
                              <TouchableOpacity
                                key={subcategory._id}
                                style={styles.dropdownItem}
                                onPress={() =>
                                  handleSubcategoryPress(subcategory)
                                }>
                                <View style={styles.dropdownItemText}>
                                  <SubcategoryIcon
                                    style={{
                                      alignSelf: 'flex-start',
                                      // marginTop: 2,
                                    }}
                                  />
                                  <Text
                                    variant="bodySmall"
                                    style={[
                                      styles.dropdownItemText,
                                      {
                                        fontWeight:
                                          Platform.OS === 'ios' ? 400 : 600,
                                      },
                                    ]}>
                                    {subcategory?.title}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        ) : (
                          <Text style={styles.noSubcategories}>
                            No subcategories available
                          </Text>
                        )}
                      </View>
                    )}
                </View>
              ))
            ) : (
              <Text style={styles.noCategories}>No categories available</Text>
            )}
          </View>

          <TutorialVideos />

          <View style={[styles.supportStyle,{paddingBottom:bottom}]}>
            <SupportIcon />
            <Text variant="labelSmall" style={styles.text}>
              For further assistance, reach out to iMeUsWe support by{' '}
              <Text suppressHighlighting style={styles.linkText} onPress={GotoFeedback}>
                Clicking here
              </Text>
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View
          style={{
            marginTop: 50,
            width: '100%',
            alignItems: 'center',
            position: 'relative',
            height: '95%',
            paddingBottom: 65,
          }}>
          <SearchFaq onSearch={handleSearch} setFocus={setFocus} />
          <View
            style={{
              position: 'absolute',
              top: 40,
              width: '80%',
              height: '90%',
            }}>
            {searchQuery.length > 0 && apiResponse?.length === 0 && (
              <Text>No article available for this.</Text>
            )}
            {searchQuery?.length > 0 ? (
              <ScrollView
                style={{maxHeight: '100%'}}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}>
                {apiResponse?.map((article, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleArticleClick(article)}>
                    <Text style={styles.articleSearchedTitle}>
                      {article.title}
                    </Text>
                  </TouchableOpacity>
                ))}

                {searchQuery?.length > 0 && (
                  <Text variant="headlineMedium" style={styles.searchFortitle}>
                    Search for "{searchQuery}"
                  </Text>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      )}
    </ErrorBoundary.Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: -50,
  },
  faqIcon: {
    marginTop: -40,
    alignSelf: 'center',
  },
  text: {
    color: '#444444',
    marginLeft: 12,
    width: '70%',
    fontSize: 16,
    fontWeight: '300',
    lineHeight: 16.4,
  },
  supportStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 50,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    margin: 'auto',
  },
  linkText: {
    color: '#2892FF',
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    width: '100%',
    borderRadius: 5,
    alignItems: 'center',
  },
  underLine: {
    borderColor: '#ccc',
    borderBottomWidth: 1,
  },
  categoryText: {
    fontSize: Platform.OS === 'ios' ? 18 : 19,
    color: newTheme.colors.blackText,
    fontWeight: 500,
  },
  icon: {
    marginLeft: 10,
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 11,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 5,
  },
  dropdownItemText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    width: '95%',
    fontSize: Platform.OS === 'ios' ? 16 : 16,
    color: newTheme.colors.blackText,
    textAlign: 'left',
  },
  noSubcategories: {
    padding: 10,
    color: 'red',
  },
  noCategories: {
    padding: 10,
    color: 'red',
  },
  categoryContainer: {
    flex: 1,
    padding: 5,
    width: '100%',
    height: '100%',
    paddingHorizontal: 30,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFortitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: newTheme.colors.primaryOrange,
    borderBottomColor: newTheme.colors.primaryOrange,
    alignSelf: 'flex-start',
  },
  articleSearchedTitle: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: 600,
  },
});

export default FaqHome;
