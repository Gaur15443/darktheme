import {useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Keyboard} from 'react-native';
import {useFormik} from 'formik';
import PropTypes from 'prop-types';
import StoryQuotes from '../StoryQuotes';
import {
  fetchQuotePrompts,
  setNewWrittenStory,
} from '../../../../store/apps/story';
import {useDispatch, useSelector} from 'react-redux';
import * as Yup from 'yup';
import EditQuoteIcon from '../../../../images/Icons/EditQuoteIcon';
import CustomInput from './../../../CustomTextInput';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {HelperText, useTheme} from 'react-native-paper';
import {createStoryStyles} from '../styles';
import Toast from 'react-native-toast-message';

/**
 * Represents a form component for adding quotes.
 * @param {object} props - The props object.
 * @param {boolean} props.postingInProgress - Indicates whether user is publishing content. If `true`, all cta interaction should disable.
 * @param {object} props.formDataRef - Reference to form data.
 * @param {string} props.formDataRef.current.description - The description of the quote.
 * @param {string} props.formDataRef.current.storiesTitle - The title of the story.
 * @param {Function} props.onValidationChange - Function to handle validation changes.
 */
export default function QuotesForm({
  formDataRef,
  postingInProgress,
  onValidationChange,
}) {
  const theme = useTheme();
  const customTheme = {
    colors: {
      primary: theme.colors.orange,
    },
  };
  const styles = createStyles();
  const navigator = useNavigation();
  const pageIsFocused = useIsFocused();
  const dispatch = useDispatch();
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [openQuotes, setOpenQuotes] = useState(false);
  const quotes = useSelector(state => state.story.quotesPrompts);
  const selectedQuote = useSelector(state => state.story.selectedQuote);

  const quotesPlaceholders = useMemo(() => {
    let shuffledQuotes = [];
    if (quotes.length && Array.isArray(quotes?.[0]?.prompts)) {
      shuffledQuotes = quotes[0].prompts
        .slice()
        .sort(() => Math.random() - 0.5);
    }
    return shuffledQuotes;
  }, [quotes]);

  const formik = useFormik({
    initialValues: {
      title: formDataRef.current.storiesTitle || '',
      description: formDataRef.current?.description || '',
    },

    validationSchema: Yup.object().shape({
      description: Yup.string()
        .required('This field is required')
        .test('space-check', 'This field is required', val => {
          return !/^\s+$/.test(val);
        })
        .max(200, 'Length cannot be more than 200'),
    }),
  });

  useEffect(() => {
    if (selectedQuote) {
      formik.setFieldValue('title', selectedQuote);
    }
  }, [selectedQuote]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (quotes.length || !pageIsFocused) {
          return;
        }
        await dispatch(fetchQuotePrompts()).unwrap();
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      } finally {
        setLoadingQuotes(false);
      }
    };

    (async () => await fetchData())();
  }, [pageIsFocused]);

  useEffect(() => {
    onValidationChange(formik.isValid);
  }, [formik.isValid, formik.values]);

  useEffect(() => {
    formDataRef.current.storiesTitle = formik.values.title;
    formDataRef.current.description = formik.values.description;

    dispatch(
      setNewWrittenStory({
        description: formik.values.description,
        storiesTitle: formik.values.title,
      }),
    );
  }, [formik]);

  function handleQuoteTitlePress() {
    try {
      navigator.navigate('StoryQuotes');
      // Keyboard.dismiss();
    } catch (_error) {
      /**empty */
    }
  }

  return (
    <View
      style={{
        backgroundColor: 'transparent',
        zIndex: 1,
        minHeight: 300,
      }}>
      {/* Title Input */}
      <CustomInput
        customTheme={customTheme}
        value={formik.values.title}
        editable={false}
        rotatingLabels={
          quotesPlaceholders.length >= 1 ? quotesPlaceholders : ['Choose quote']
        }
        right={<EditQuoteIcon />}
        style={[
          {backgroundColor: 'white', height: 62},
          createStoryStyles.inputContainer,
        ]}
        accessibilityLabel="quote-title"
        maskText
        multiline
        inputHeight={62}
        onMaskPress={handleQuoteTitlePress}
        showSoftInputOnFocus={false}
      />
      {/* Title input ends */}

      {/* Description Input */}
      <View
        style={{
          backgroundColor: 'transparent',
        }}>
        <CustomInput
          multiline
          customTheme={customTheme}
          textVerticalAlign="top"
          disabled={postingInProgress}
          maxLength={200}
          style={[
            {
              backgroundColor: '#FFFF',
              borderRadius: 10,
              marginTop: 10,
              height: 150,
            },
            createStoryStyles.inputContainer,
          ]}
          mode="outlined"
          name="Finish off the quote"
          label="Finish off the quote"
          required
          inputHeight={150}
          centerNumber={15}
          value={formik.values.description}
          error={
            formik.touched.description && Boolean(formik.errors.description)
          }
          errorText={formik.errors.description}
          onBlur={formik.handleBlur('description')}
          onChangeText={text => {
            if (text?.length <= 200) {
              if (!formik.touched.description) {
                formik.setFieldTouched('description', true, true);
              }

              formik.handleChange('description')(text);
            }
          }}
          accessibilityLabel="quotes-description"
          placeholderTextColor="rgba(51, 48, 60, 0.6)"
        />
      </View>
      {/* Description input ends */}
      {/* {openQuotes && (
        <StoryQuotes
          openPopUp={openQuotes}
          onClose={(data, quote) => {
            if (quote?.length) {
              formik.setFieldValue('title', quote);
            }
            setOpenQuotes(data);
          }}
        />
      )} */}
    </View>
  );
}

// PropTypes validation
QuotesForm.propTypes = {
  formDataRef: PropTypes.shape({
    current: PropTypes.shape({
      storiesTitle: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  postingInProgress: PropTypes.bool,
  onValidationChange: PropTypes.func.isRequired,
};

function createStyles() {
  return StyleSheet.create({
    descLength: {
      textAlign: 'right',
      marginRight: 10,
    },
    input: {
      backgroundColor: 'white',
      margin: 12,
      borderRadius: 10,
    },
    descriptionInput: {
      backgroundColor: 'white',
      borderRadius: 10,
      height: 150,
      marginBottom: 200,
    },
    tabButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#FFFFFF',
      padding: 8,
      borderRadius: 7,
    },
    buttonText: {
      fontWeight: 'bold',
      color: 'black',
      fontSize: 15,
      paddingHorizontal: 6,
    },
    tabContainer: {
      alignItems: 'center',
      padding: 10,
    },
    headerText: {
      textAlign: 'center',
      fontWeight: '600',
      color: 'white',
      fontSize: 17,
      marginHorizontal: 20,
    },
    inputContainer: {
      marginHorizontal: 10,
      marginVertical: 5,
      display: 'flex',
    },
    textInputStyle: {
      backgroundColor: '#FFF',
    },
  });
}
