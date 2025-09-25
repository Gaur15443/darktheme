import {
    View,
} from 'react-native';
import { memo, useCallback } from 'react';
import { useTheme } from 'react-native-paper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AstroBirthForm from '../../../components/AstrologyBirthForm';
import ErrorBoundary from '../../../common/ErrorBoundary';
import AstroHeader from '../../../common/AstroHeader';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import AstroBirthDetailsTabsReports from '../../../components/AstroConsultation/AstroBirthDetailsTabs/AstroBirthDetailsTabsReports';
import AstroBirthDetailsTabs from '../../../components/AstroConsultation/AstroBirthDetailsTabs/AstroBirthDetailsTabs';
import { checkIfReportIsPurchased, setStoredKundliObject, updateSavedKundli } from '../../../store/apps/astroKundali';
import type { SaveKundliData } from '../../../store/apps/astroKundali/index.d';
import Toast from 'react-native-toast-message';

const AstroBirthDetailsScreen = memo(() => {
    const navigator = useNavigation<NavigationProp<any>>();
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const savedKundlis = useSelector(
        (state: RootState) => state.astroKundaliSlice.savedKundlis,
    );
    const isFirstTimeUser = useSelector(
        (state: RootState) => state.astroKundaliSlice.isFirstTimeUser,
    );
    const reportId = useSelector(
        (state: RootState) => state.astroKundaliSlice.selectedReportId,
    );
    const typeOfReport = useSelector(
        (state: RootState) => state.astroKundaliSlice.selectedReport,
    );


    const goBack = useCallback(() => {
        navigator.goBack();
    }, []);

    return (
        <ErrorBoundary.Screen>
            <View style={{ flex: 1, backgroundColor: theme.colors.background, }}>
                <AstroHeader>
                    <AstroHeader.BackAction onPress={goBack} />
                    <AstroHeader.Content title="Birth Details" />
                </AstroHeader>
                {(savedKundlis?.length || !isFirstTimeUser) ? <AstroBirthDetailsTabsReports
                    showHeader={false}
                    onBack={goBack}
                    onArrowClick={async (_data: SaveKundliData) => {
                        try {
                            dispatch(updateSavedKundli(_data));
                            dispatch(setStoredKundliObject(_data));
                            if (reportId) {
                                const result = await dispatch(checkIfReportIsPurchased({
                                    kundliId: _data._id,
                                    reportId: reportId
                                })).unwrap();


                                if (result.isPurchasedAlert) {
                                    Toast.show({
                                        type: "error",
                                        text1: `This ${typeOfReport} Report is already purchased. View it in My Orders`,
                                    });
                                }
                                else {
                                    navigator.navigate('ReportsPaymentScreen', {
                                        kundli: _data,
                                    });
                                }
                            }
                            else {
                                navigator.navigate('ReportsPaymentScreen', {
                                    kundli: _data,
                                });
                            }
                        }
                        catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: error.message
                            })
                        }
                    }}
                    onNewKundli={_data => {
                        dispatch(updateSavedKundli(_data));
                        dispatch(setStoredKundliObject(_data));
                        navigator.navigate('ReportsPaymentScreen', {
                            kundli: _data,
                        });
                    }}
                /> :
                    <AstroBirthForm />}
            </View >
        </ErrorBoundary.Screen>
    );
});

export default AstroBirthDetailsScreen;
