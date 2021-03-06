/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { elasticsearchServiceMock, savedObjectsClientMock } from 'src/core/server/mocks';
import type { SavedObject } from 'kibana/server';

import { AGENT_TYPE_PERMANENT } from '../../../common/constants';
import type { AgentSOAttributes } from '../../../common/types/models';

import { getAgentStatusById } from './status';

describe('Agent status service', () => {
  it('should return inactive when agent is not active', async () => {
    const mockSavedObjectsClient = savedObjectsClientMock.create();
    const mockElasticsearchClient = elasticsearchServiceMock.createClusterClient().asInternalUser;
    mockSavedObjectsClient.get = jest.fn().mockReturnValue({
      id: 'id',
      type: AGENT_TYPE_PERMANENT,
      attributes: {
        active: false,
        local_metadata: {},
        user_provided_metadata: {},
      },
    } as SavedObject<AgentSOAttributes>);
    const status = await getAgentStatusById(mockSavedObjectsClient, mockElasticsearchClient, 'id');
    expect(status).toEqual('inactive');
  });

  it('should return online when agent is active', async () => {
    const mockSavedObjectsClient = savedObjectsClientMock.create();
    const mockElasticsearchClient = elasticsearchServiceMock.createClusterClient().asInternalUser;
    mockSavedObjectsClient.get = jest.fn().mockReturnValue({
      id: 'id',
      type: AGENT_TYPE_PERMANENT,
      attributes: {
        active: true,
        last_checkin: new Date().toISOString(),
        local_metadata: {},
        user_provided_metadata: {},
      },
    } as SavedObject<AgentSOAttributes>);
    const status = await getAgentStatusById(mockSavedObjectsClient, mockElasticsearchClient, 'id');
    expect(status).toEqual('online');
  });

  it('should return enrolling when agent is active but never checkin', async () => {
    const mockSavedObjectsClient = savedObjectsClientMock.create();
    const mockElasticsearchClient = elasticsearchServiceMock.createClusterClient().asInternalUser;
    mockSavedObjectsClient.get = jest.fn().mockReturnValue({
      id: 'id',
      type: AGENT_TYPE_PERMANENT,
      attributes: {
        active: true,
        local_metadata: {},
        user_provided_metadata: {},
      },
    } as SavedObject<AgentSOAttributes>);
    const status = await getAgentStatusById(mockSavedObjectsClient, mockElasticsearchClient, 'id');
    expect(status).toEqual('enrolling');
  });

  it('should return unenrolling when agent is unenrolling', async () => {
    const mockSavedObjectsClient = savedObjectsClientMock.create();
    const mockElasticsearchClient = elasticsearchServiceMock.createClusterClient().asInternalUser;
    mockSavedObjectsClient.get = jest.fn().mockReturnValue({
      id: 'id',
      type: AGENT_TYPE_PERMANENT,
      attributes: {
        active: true,
        last_checkin: new Date().toISOString(),
        unenrollment_started_at: new Date().toISOString(),
        local_metadata: {},
        user_provided_metadata: {},
      },
    } as SavedObject<AgentSOAttributes>);
    const status = await getAgentStatusById(mockSavedObjectsClient, mockElasticsearchClient, 'id');
    expect(status).toEqual('unenrolling');
  });
});
