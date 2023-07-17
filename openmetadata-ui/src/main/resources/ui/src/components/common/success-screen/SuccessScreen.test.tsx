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

import { render, screen } from '@testing-library/react';
import { PIPELINE_SERVICE_PLATFORM } from 'constants/Services.constant';
import React from 'react';
import { FormSubmitType } from '../../../enums/form.enum';
import SuccessScreen, { SuccessScreenProps } from './SuccessScreen';

jest.mock('../../../hooks/useAirflowStatus', () => ({
  useAirflowStatus: jest.fn().mockImplementation(() => ({
    isAirflowAvailable: true,
    fetchAirflowStatus: jest.fn(),
    isFetchingStatus: false,
    platform: PIPELINE_SERVICE_PLATFORM,
  })),
}));

const mockViewService = jest.fn();
const mockDeployService = jest.fn();
const mockIngestService = jest.fn();

const mockProps: SuccessScreenProps = {
  name: 'newService',
  suffix: 'suffix',
  successMessage: 'this is success message',
  showIngestionButton: true,
  showDeployButton: true,
  state: FormSubmitType.ADD,
  viewServiceText: 'View New Service',
  handleViewServiceClick: mockViewService,
  handleDeployClick: mockDeployService,
  handleIngestionClick: mockIngestService,
};

describe('Test SuccessScreen component', () => {
  it('SuccessScreen component should render', async () => {
    render(<SuccessScreen {...mockProps} />);

    const successScreenContainer = await screen.findByTestId(
      'success-screen-container'
    );
    const successIcon = await screen.findByTestId('success-icon');
    const successLine = await screen.findByTestId('success-line');
    const viewServiceBtn = await screen.findByTestId('view-service-button');
    const addIngestionBtn = await screen.findByTestId('add-ingestion-button');
    const deployButton = await screen.findByTestId('deploy-ingestion-button');

    const statusMsg = screen.queryByTestId('airflow-platform-message');

    expect(successScreenContainer).toBeInTheDocument();

    expect(successIcon).toBeInTheDocument();
    expect(successLine).toBeInTheDocument();

    expect(viewServiceBtn).toBeInTheDocument();
    expect(addIngestionBtn).toBeInTheDocument();
    expect(deployButton).toBeInTheDocument();

    expect(statusMsg).not.toBeInTheDocument();
  });
});
