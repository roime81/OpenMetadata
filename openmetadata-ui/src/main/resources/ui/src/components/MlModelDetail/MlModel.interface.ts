/*
 *  Copyright 2023 Collate.
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

import { OperationPermission } from 'components/PermissionProvider/PermissionProvider.interface';
import { ThreadType } from 'generated/api/feed/createThread';
import { Mlmodel } from 'generated/entity/data/mlmodel';
import { EntityFieldThreads } from 'interface/feed.interface';

export interface MlModelFeaturesListProp {
  mlFeatures: Mlmodel['mlFeatures'];
  permissions: OperationPermission;
  handleFeaturesUpdate: (features: Mlmodel['mlFeatures']) => Promise<void>;
  isDeleted?: boolean;
  entityFqn: string;
  entityFieldThreads: EntityFieldThreads[];
  onThreadLinkSelect: (value: string, threadType?: ThreadType) => void;
}
