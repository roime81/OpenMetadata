/*
 *  Copyright 2022 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { AxiosError } from 'axios';
import ErrorPlaceHolder from 'components/common/error-with-placeholder/ErrorPlaceHolder';
import Loader from 'components/Loader/Loader';
import { usePermissionProvider } from 'components/PermissionProvider/PermissionProvider';
import { ResourceEntity } from 'components/PermissionProvider/PermissionProvider.interface';
import PipelineDetails from 'components/PipelineDetails/PipelineDetails.component';
import { ERROR_PLACEHOLDER_TYPE } from 'enums/common.enum';
import { compare, Operation } from 'fast-json-patch';
import { isUndefined, omitBy } from 'lodash';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import {
  addFollower,
  getPipelineByFqn,
  patchPipelineDetails,
  removeFollower,
} from 'rest/pipelineAPI';
import { getVersionPath } from '../../constants/constants';
import { EntityType } from '../../enums/entity.enum';
import { Pipeline } from '../../generated/entity/data/pipeline';
import { EntityReference } from '../../generated/type/entityReference';
import { Paging } from '../../generated/type/paging';
import {
  addToRecentViewed,
  getCurrentUserId,
  getEntityMissingError,
} from '../../utils/CommonUtils';
import { getEntityName } from '../../utils/EntityUtils';
import { DEFAULT_ENTITY_PERMISSION } from '../../utils/PermissionsUtils';
import {
  defaultFields,
  getFormattedPipelineDetails,
} from '../../utils/PipelineDetailsUtils';
import { showErrorToast } from '../../utils/ToastUtils';

const PipelineDetailsPage = () => {
  const { t } = useTranslation();
  const USERId = getCurrentUserId();
  const history = useHistory();

  const { pipelineFQN } = useParams<{ pipelineFQN: string }>();
  const [pipelineDetails, setPipelineDetails] = useState<Pipeline>(
    {} as Pipeline
  );

  const [isLoading, setLoading] = useState<boolean>(true);
  const [followers, setFollowers] = useState<Array<EntityReference>>([]);

  const [isError, setIsError] = useState(false);

  const [paging] = useState<Paging>({} as Paging);

  const [pipelinePermissions, setPipelinePermissions] = useState(
    DEFAULT_ENTITY_PERMISSION
  );

  const { getEntityPermissionByFqn } = usePermissionProvider();

  const fetchResourcePermission = async (entityFqn: string) => {
    setLoading(true);
    try {
      const entityPermission = await getEntityPermissionByFqn(
        ResourceEntity.PIPELINE,
        entityFqn
      );
      setPipelinePermissions(entityPermission);
    } catch (error) {
      showErrorToast(
        t('server.fetch-entity-permissions-error', {
          entity: entityFqn,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const { pipelineId, currentVersion } = useMemo(() => {
    return {
      pipelineId: pipelineDetails.id,
      currentVersion: pipelineDetails.version + '',
    };
  }, [pipelineDetails]);

  const saveUpdatedPipelineData = useCallback(
    (updatedData: Pipeline) => {
      const jsonPatch = compare(
        omitBy(pipelineDetails, isUndefined),
        updatedData
      );

      return patchPipelineDetails(pipelineId, jsonPatch);
    },
    [pipelineDetails]
  );

  const fetchPipelineDetail = async (pipelineFQN: string) => {
    setLoading(true);

    try {
      const res = await getPipelineByFqn(pipelineFQN, defaultFields);
      const { id, fullyQualifiedName, serviceType } = res;

      setPipelineDetails(res);

      addToRecentViewed({
        displayName: getEntityName(res),
        entityType: EntityType.PIPELINE,
        fqn: fullyQualifiedName ?? '',
        serviceType: serviceType,
        timestamp: 0,
        id: id,
      });
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        setIsError(true);
      } else {
        showErrorToast(
          error as AxiosError,
          t('server.entity-details-fetch-error', {
            entityType: t('label.pipeline'),
            entityName: pipelineFQN,
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const followPipeline = async (fetchCount: () => void) => {
    try {
      const res = await addFollower(pipelineId, USERId);
      const { newValue } = res.changeDescription.fieldsAdded[0];
      setFollowers([...followers, ...newValue]);
      fetchCount();
    } catch (error) {
      showErrorToast(
        error as AxiosError,
        t('server.entity-follow-error', {
          entity: getEntityName(pipelineDetails),
        })
      );
    }
  };

  const unFollowPipeline = async (fetchCount: () => void) => {
    try {
      const res = await removeFollower(pipelineId, USERId);
      const { oldValue } = res.changeDescription.fieldsDeleted[0];
      setFollowers(
        followers.filter((follower) => follower.id !== oldValue[0].id)
      );
      fetchCount();
    } catch (error) {
      showErrorToast(
        error as AxiosError,
        t('server.entity-unfollow-error', {
          entity: getEntityName(pipelineDetails),
        })
      );
    }
  };

  const descriptionUpdateHandler = async (updatedPipeline: Pipeline) => {
    try {
      const response = await saveUpdatedPipelineData(updatedPipeline);
      setPipelineDetails(response);
    } catch (error) {
      showErrorToast(error as AxiosError);
    }
  };

  const settingsUpdateHandler = async (updatedPipeline: Pipeline) => {
    try {
      const res = await saveUpdatedPipelineData(updatedPipeline);
      setPipelineDetails({ ...res, tags: res.tags ?? [] });
    } catch (error) {
      showErrorToast(
        error as AxiosError,
        t('server.entity-updating-error', {
          entity: getEntityName(pipelineDetails),
        })
      );
    }
  };

  const onTaskUpdate = async (jsonPatch: Array<Operation>) => {
    try {
      const response = await patchPipelineDetails(pipelineId, jsonPatch);
      const formattedPipelineDetails = getFormattedPipelineDetails(response);
      setPipelineDetails(formattedPipelineDetails);
    } catch (error) {
      showErrorToast(error as AxiosError);
    }
  };

  const versionHandler = () => {
    history.push(
      getVersionPath(EntityType.PIPELINE, pipelineFQN, currentVersion as string)
    );
  };

  const handleExtensionUpdate = async (updatedPipeline: Pipeline) => {
    try {
      const data = await saveUpdatedPipelineData(updatedPipeline);
      setPipelineDetails(data);
    } catch (error) {
      showErrorToast(
        error as AxiosError,
        t('server.entity-updating-error', {
          entity: getEntityName(pipelineDetails),
        })
      );
    }
  };

  useEffect(() => {
    if (pipelinePermissions.ViewAll || pipelinePermissions.ViewBasic) {
      fetchPipelineDetail(pipelineFQN);
    }
  }, [pipelinePermissions, pipelineFQN]);

  useEffect(() => {
    fetchResourcePermission(pipelineFQN);
  }, [pipelineFQN]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <ErrorPlaceHolder>
        {getEntityMissingError('pipeline', pipelineFQN)}
      </ErrorPlaceHolder>
    );
  }

  if (!pipelinePermissions.ViewAll && !pipelinePermissions.ViewBasic) {
    return <ErrorPlaceHolder type={ERROR_PLACEHOLDER_TYPE.PERMISSION} />;
  }

  return (
    <PipelineDetails
      descriptionUpdateHandler={descriptionUpdateHandler}
      fetchPipeline={() => fetchPipelineDetail(pipelineFQN)}
      followPipelineHandler={followPipeline}
      followers={followers}
      paging={paging}
      pipelineDetails={pipelineDetails}
      pipelineFQN={pipelineFQN}
      settingsUpdateHandler={settingsUpdateHandler}
      taskUpdateHandler={onTaskUpdate}
      unFollowPipelineHandler={unFollowPipeline}
      versionHandler={versionHandler}
      onExtensionUpdate={handleExtensionUpdate}
    />
  );
};

export default observer(PipelineDetailsPage);
