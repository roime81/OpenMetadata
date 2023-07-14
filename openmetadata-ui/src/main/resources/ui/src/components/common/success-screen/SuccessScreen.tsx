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

import { Button, Card, Space, Typography } from 'antd';
import { ReactComponent as IconCollateSupport } from 'assets/svg/ic-collate-support.svg';
import { ReactComponent as IconSuccessBadge } from 'assets/svg/success-badge.svg';
import classNames from 'classnames';
import Loader from 'components/Loader/Loader';
import { AIRFLOW_DOCS } from 'constants/docs.constants';
import { PIPELINE_SERVICE_PLATFORM } from 'constants/Services.constant';
import { isUndefined } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormSubmitType } from '../../../enums/form.enum';
import { useAirflowStatus } from '../../../hooks/useAirflowStatus';
import AirflowMessageBanner from '../AirflowMessageBanner/AirflowMessageBanner';

type SuccessScreenProps = {
  name: string;
  suffix?: string;
  successMessage?: JSX.Element;
  showIngestionButton: boolean;
  showDeployButton?: boolean;
  state: FormSubmitType;
  viewServiceText?: string;
  handleIngestionClick?: () => void;
  handleViewServiceClick: () => void;
  handleDeployClick?: () => void;
};

const SuccessScreen = ({
  name,
  suffix,
  showIngestionButton,
  showDeployButton = false,

  handleIngestionClick,
  handleViewServiceClick,
  handleDeployClick,
  successMessage,
  viewServiceText,
}: SuccessScreenProps) => {
  const { t } = useTranslation();
  const { isAirflowAvailable, platform, isFetchingStatus } = useAirflowStatus();

  const isAirflowPlatform = platform === PIPELINE_SERVICE_PLATFORM;

  const messageElement = isAirflowPlatform ? (
    <div data-testid="airflow-platform-message">
      <div>
        <h6 className="text-base text-grey-body font-medium">
          {t('message.manage-airflow-api-failed')}
        </h6>

        <p className="text-grey-body text-sm m-b-md">
          {t('message.airflow-guide-message')}
        </p>
      </div>

      <p>
        <a href={AIRFLOW_DOCS} rel="noopener noreferrer" target="_blank">
          {`${t('label.install-airflow-api')} >>`}
        </a>
      </p>
    </div>
  ) : (
    <Space
      align="center"
      className="justify-center w-full m-t-sm"
      data-testid="argo-platform-message"
      direction="vertical"
      size={16}>
      <IconCollateSupport height={100} width={100} />
      <Typography>{t('message.pipeline-scheduler-message')}</Typography>
    </Space>
  );

  return (
    <div
      className="d-flex flex-col tw-mt-14 tw-mb-24 tw-mx-8 tw-px-1"
      data-testid="success-screen-container">
      <Card>
        <Space>
          <IconSuccessBadge data-testid="success-icon" width="20px" />
          <Typography.Paragraph
            className="m-b-0"
            data-testid="success-line"
            ellipsis={{ rows: 3 }}>
            {isUndefined(successMessage) ? (
              <span>
                <span className="tw-mr-1 tw-font-semibold">
                  {`"${name || 'demo_mysql'}"`}
                </span>
                {suffix && <span className="tw-mr-1">{suffix}</span>}
                <span>{t('message.has-been-created-successfully')}</span>
              </span>
            ) : (
              successMessage
            )}
          </Typography.Paragraph>
        </Space>
      </Card>
      <AirflowMessageBanner className="m-t-sm" />
      <Card className="m-t-sm">
        {isFetchingStatus ? <Loader /> : <>{messageElement}</>}
      </Card>

      <div className="tw-mt-7 tw-text-center">
        <Button
          ghost
          data-testid="view-service-button"
          type="primary"
          onClick={handleViewServiceClick}>
          <span>
            {viewServiceText ??
              t('label.view-entity', { entity: t('label.service') })}
          </span>
        </Button>

        {showIngestionButton && (
          <Button
            className={classNames('tw-ml-3.5', {
              'tw-opacity-40 tw-pointer-events-none': !isAirflowAvailable,
            })}
            data-testid="add-ingestion-button"
            disabled={!isAirflowAvailable}
            type="primary"
            onClick={handleIngestionClick}>
            <span>
              {t('label.add-entity', { entity: t('label.ingestion') })}
            </span>
          </Button>
        )}

        {showDeployButton && (
          <Button
            className={classNames('tw-ml-3.5', {
              'tw-opacity-40 tw-pointer-events-none': !isAirflowAvailable,
            })}
            data-testid="add-ingestion-button"
            disabled={!isAirflowAvailable}
            type="primary"
            onClick={handleDeployClick}>
            <span>{t('label.deploy')}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SuccessScreen;
