import { memo, useCallback, useRef } from "react";
import { Dimensions, Pressable, View } from "react-native";
import GradientView from "../../../common/gradient-view";
import { Divider, Text } from "react-native-paper";
import OutlinedEyeIcon from "../../../images/Icons/OutlinedEyeIcon";
import { useNavigation } from "@react-navigation/native";
import OutlinedTickIcon from "../../../images/Icons/OutlinedTickIcon";
import { Track } from "../../../../App";
import { useDispatch, useSelector } from "react-redux";
import FastImage from "@d11/react-native-fast-image";
import { setSelectedReport, setSelectedReportDiscount, setSelectedReportId, setSelectedReportPrice } from "../../../store/apps/astroKundali";
import { setSelected, setSelectedIndex } from "../../../store/apps/reportsSlide";
import Carousel from "react-native-snap-carousel";

const MemoizedSlide = memo(({ _slide, slideIndex, handleReportSelection }) => {
    const navigator = useNavigation();
    const selected = useSelector(state => state.reportsSlide.selected);
    const selectedIndex = useSelector(state => state.reportsSlide.selectedIndex);
    const userData = useSelector((state) => state.userInfo);
    const dispatch = useDispatch();

    return <View style={{
        minHeight: 384,
        overflow: 'hidden',
    }}>
        <GradientView
            style={{
                overflow: 'hidden',
                borderRadius: 8,
            }}
            contentStyle={{
                padding: 16,
                borderColor: '#FFFFFF33',
                borderWidth: 1,
                borderRadius: 8,
                width: '100%',
                overflow: 'hidden',
                flexGrow: 1,
                minHeight: 384,
            }}
            colors={
                (selectedIndex === slideIndex && selected)
                    ? null
                    : // Not paid and not selected
                    ['transparent', 'transparent']
            }>
            <View
                style={{
                    flexDirection: 'row',
                    gap: 11,
                }}>
                <FastImage
                    source={{
                        uri: _slide.banner,
                    }}
                    style={{
                        width: 82,
                        height: 82,
                        borderRadius: 8,
                    }}
                />
                <View
                    style={{
                        justifyContent: 'center',
                    }}>
                    <Text
                        variant="bold"
                        style={{
                            fontSize: 24,
                        }}>{_slide?.titleOfReport}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, }}>
                        <Text style={{ fontSize: 16 }}>{`₹${_slide?.activeOfferId?.[0]?.offerPrice?.inr}`}</Text>
                        <Text
                            style={{
                                color: '#888888',
                                textDecorationLine: 'line-through',
                                fontSize: 12
                            }}>
                            {`₹${_slide?.activeOfferId?.[0]?.originalPrice?.inr}`}
                        </Text>
                        <View
                            style={{
                                backgroundColor: '#27C39426',
                                padding: 4,
                                borderRadius: 47,
                                borderWidth: 1,
                                borderColor: '#27C394',
                            }}>
                            <Text
                                style={{
                                    color: '#27C394',
                                    textAlign: 'center',
                                    fontSize: 8
                                }}>
                                {`${_slide?.activeOfferId?.[0]?.offerPercentage}% Off`}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            <Divider
                style={{
                    backgroundColor: '#fff',
                    color: '#fff',
                    marginBlock: 24,
                }}
            />
            <View>
                {_slide.description.map((text, index) => (
                    <View
                        key={index}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 8,
                            paddingRight: 3,
                        }}>
                        <OutlinedTickIcon />
                        <Text style={{ marginLeft: 8, padding: 1 }}>{text}</Text>
                    </View>
                ))}
            </View>

            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginHorizontal: 10,
                    marginBlock: 10,
                }}>
                <OutlinedEyeIcon />
                <Pressable
                    onPress={() => {
                        const sampleUrl = _slide?.sampleReport || '';
                        const sampleType = _slide.typeOfReport;

                        navigator.navigate('AstroViewReports', {
                            sampleUrl,
                            sampleType,
                        });

                        const props = {
                            reportName: sampleType
                        }

                        Track({
                            cleverTapEvent: "Reports_Sample",
                            mixpanelEvent: "Reports_Sample",
                            userData,
                            mixpanelProps: props,
                            cleverTapProps: props
                        });
                    }}>
                    <Text
                        style={{
                            paddingHorizontal: 5,
                            paddingBlock: 16,
                        }}>
                        View Sample
                    </Text>
                </Pressable>
            </View>

            <Pressable
                onPress={() => {
                    if (selected && selectedIndex === slideIndex
                    ) {
                        dispatch(setSelected(false));
                        return;
                    }
                    handleReportSelection(_slide, slideIndex);
                }}
                style={{
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    height: 46,
                    width: '100%',
                    overflow: 'hidden',
                }}>
                <View
                    style={{
                        borderColor: '#FFFFFF',
                        borderWidth: 0.5,
                        borderRadius: 8,
                        width: '100%',
                        height: 46,
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}>
                    <Text
                        variant="bold"
                        style={{ textAlign: 'center', fontSize: 14 }}>
                        {(selectedIndex === slideIndex && selected) ? 'Selected' : 'Select'}
                    </Text>
                </View>
            </Pressable>
        </GradientView>
    </View>
});

function ReportsSlide() {
    const swiperRef = useRef();
    const reports = useSelector(state => state.astroKundaliSlice.astroReports);
    const userData = useSelector((state) => state.userInfo);
    const dispatch = useDispatch();

    const handleReportSelection = useCallback((_slide, slideIndex) => {

        const props = {
            reportName: _slide?.titleOfReport,
            reportPrice: _slide?.activeOfferId?.[0]?.originalPrice?.inr
        };

        Track({
            cleverTapEvent: "Report_Select",
            mixpanelEvent: "Report_Select",
            userData,
            mixpanelProps: props,
            cleverTapProps: props
        });

        dispatch(setSelectedReport(_slide.typeOfReport));
        dispatch(setSelectedReportId(_slide._id));
        dispatch(
            setSelectedReportPrice(_slide?.activeOfferId?.[0]?.originalPrice?.inr),
        );
        dispatch(
            setSelectedReportDiscount(
                _slide?.activeOfferId?.[0]?.originalPrice?.inr -
                _slide?.activeOfferId?.[0]?.offerPrice?.inr,
            ),
        );
        dispatch(setSelected(true));
        dispatch(setSelectedIndex(slideIndex));
    }, []);

    const { width: screenWidth } = Dimensions.get('window');

    const renderCarouselItem = useCallback(({ item, index }) => (
        <MemoizedSlide
            key={index}
            _slide={item}
            slideIndex={index}
            handleReportSelection={handleReportSelection}
        />
    ), [handleReportSelection]);


    return <Carousel
        loop={false}
        ref={swiperRef}
        data={reports?.filter?.(report => report?.status?.toLowerCase?.() !== 'hide') || []}
        renderItem={renderCarouselItem}
        sliderWidth={screenWidth - 20}
        itemWidth={(screenWidth - 20) * 0.88}
        inactiveSlideScale={0.95}
        inactiveSlideOpacity={0.7}
    />

}

export default memo(ReportsSlide);