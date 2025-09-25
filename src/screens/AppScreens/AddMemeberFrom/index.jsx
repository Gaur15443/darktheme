import React, {useState, useRef, useEffect} from 'react';
import AddMemberDetails from '../../../components/add-member';
import RelationShipSelection from '../../../components/add-member/relationship-selection';
import {getmSpouseData} from '../../../store/apps/tree';
import {useDispatch} from 'react-redux';
import Toast from 'react-native-toast-message';
import ErrorBoundary from '../../../common/ErrorBoundary';
import {setAdjustResize, setAdjustPan} from 'rn-android-keyboard-adjust';
import {Platform} from 'react-native';
const AddMemberForm = ({route}) => {
  const {
    relation,
    treeId,
    userId,
    currentTreeDetails,
    // mSpouseData,
    spouseName,
    spouseValidation,
    adaptedChild,
    addingChildFromBlank,
    spouseIdToAdd,
    emptyCardWithChildren,
    isBlankClick,
    cLinkDataFromBalkan,
  } = route?.params;
  const dispatch = useDispatch();
  const [isRelation, setRelation] = useState('');
  const [fromRelationShipSelection, setfromRelationShipSelection] =
    useState(false);

  const mSpouseData = useRef(null);
  const SelectedRelation = async data => {
    try {
      if (!isBlankClick) {
        const arr = spouseValidation?.pids?.filter?.(
          sp => !sp?.includes?.('ft'),
        );
        let response = null;
        if (arr?.length) {
          response = await dispatch(getmSpouseData({mSpouses: arr})).unwrap();
          mSpouseData.current = response;
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    } finally {
      setRelation(data);
    }
  };
  useEffect(() => {
    if (Platform.OS === 'android') {
      setAdjustResize();
      return () => {
        setAdjustPan();
      };
    }
  }, []);
  return (
    <>
      <ErrorBoundary.Screen>
        {isRelation || relation ? (
          <AddMemberDetails
            treeId={treeId}
            userId={userId}
            setRelation={setRelation}
            setfromRelationShipSelection={setfromRelationShipSelection}
            fromRelationShipSelection={fromRelationShipSelection}
            relation={relation || isRelation}
            currentTreeDetails={currentTreeDetails}
            mSpouseData={mSpouseData.current || null}
            spouseName={spouseName}
            adaptedChild={adaptedChild || false}
            addingChildFromBlank={addingChildFromBlank || false}
            spouseIdToAdd={spouseIdToAdd || null}
            emptyCardWithChildren={emptyCardWithChildren}
            cLinkDataFromBalkan={cLinkDataFromBalkan}
          />
        ) : (
          <RelationShipSelection
            treeId={treeId}
            userId={userId}
            SelectedRelation={SelectedRelation}
            setfromRelationShipSelection={setfromRelationShipSelection}
            cLinkDataFromBalkan={cLinkDataFromBalkan}
          />
        )}
      </ErrorBoundary.Screen>
    </>
    // <RelationShipSelection SelectedRelation={SelectedRelation} />
  );
};

export default AddMemberForm;
