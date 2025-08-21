import {
  resetRouterEventsSubject,
  routerEventsSubject,
  cacheServiceMock,
  routeMock,
  actionsServiceMock,
  apiServiceMock,
  httpClientMock,
  routerMock,
  submissionServiceMock,
  mockLatestResults,
  mockGreenChecks,
  mockInstitutions,
  mockInstitutionsTypes,
  mockLanguages,
  mockSessionPurpose,
  mockSessionTypes,
  mockResultsStatus,
  mockIndicatorsResults,
  getMetadataServiceMock,
  clarityServiceMock,
  getResultsServiceMock,
  getUserStaffServiceMock,
  versionWatcherServiceMock
} from './mock-services.mock';

describe('mock-services.mock', () => {
  describe('routerEventsSubject', () => {
    it('should reset router events subject', () => {
      const originalSubject = routerEventsSubject.get();
      resetRouterEventsSubject();
      const newSubject = routerEventsSubject.get();
      expect(newSubject).not.toBe(originalSubject);
    });

    it('should get router events subject', () => {
      const subject = routerEventsSubject.get();
      expect(subject).toBeDefined();
    });
  });

  describe('cacheServiceMock', () => {
    it('should have correct structure', () => {
      expect(cacheServiceMock.windowHeight).toBeDefined();
      expect(cacheServiceMock.dataCache).toBeDefined();
      expect(cacheServiceMock.isLoggedIn).toBeDefined();
      expect(cacheServiceMock.currentMetadata).toBeDefined();
      expect(cacheServiceMock.currentResultId).toBeDefined();
      expect(cacheServiceMock.currentRouteTitle).toBeDefined();
      expect(cacheServiceMock.showSectionHeaderActions).toBeDefined();
      expect(cacheServiceMock.isSidebarCollapsed).toBeDefined();
      expect(cacheServiceMock.hasSmallScreen).toBeDefined();
      expect(cacheServiceMock.toggleSidebar).toBeDefined();
      expect(cacheServiceMock.get).toBeDefined();
      expect(cacheServiceMock.set).toBeDefined();
      expect(cacheServiceMock.remove).toBeDefined();
      expect(cacheServiceMock.clear).toBeDefined();
      expect(cacheServiceMock.currentResultIsLoading).toBeDefined();
      expect(cacheServiceMock.loading).toBeDefined();
      expect(cacheServiceMock.headerHeight).toBeDefined();
      expect(cacheServiceMock.showSubmissionHistory).toBeDefined();
      expect(cacheServiceMock.isMyResult).toBeDefined();
    });

    it('should return correct values from methods', () => {
      expect(cacheServiceMock.currentMetadata()).toEqual({ result_title: 'Test Title', status_id: 1 });
      expect(cacheServiceMock.currentRouteTitle()).toBe('Home');
      expect(cacheServiceMock.isSidebarCollapsed()).toBe(false);
      expect(cacheServiceMock.hasSmallScreen()).toBe(false);
      expect(cacheServiceMock.currentResultIsLoading()).toBe(false);
      expect(cacheServiceMock.loading()).toBe(false);
      expect(cacheServiceMock.isMyResult()).toBe(true);
    });
  });

  describe('routeMock', () => {
    it('should have correct structure', () => {
      expect(routeMock.snapshot).toBeDefined();
      expect(routeMock.snapshot.url).toEqual([]);
      expect(routeMock.snapshot.params).toEqual({});
      expect(routeMock.snapshot.queryParams).toEqual({});
      expect(routeMock.snapshot.fragment).toBeNull();
      expect(routeMock.snapshot.data).toEqual({});
      expect(routeMock.snapshot.outlet).toBe('');
      expect(routeMock.snapshot.component).toBeNull();
      expect(routeMock.snapshot.routeConfig).toBeNull();
      expect(routeMock.snapshot.root).toBeDefined();
      expect(routeMock.snapshot.parent).toBeNull();
      expect(routeMock.snapshot.firstChild).toBeNull();
      expect(routeMock.snapshot.children).toEqual([]);
      expect(routeMock.snapshot.pathFromRoot).toEqual([]);
      expect(routeMock.snapshot.paramMap).toBeDefined();
      expect(routeMock.snapshot.queryParamMap).toBeDefined();
    });

    it('should have working paramMap methods', () => {
      const paramMap = routeMock.snapshot.paramMap;
      expect(paramMap.get('test')).toBeNull();
      expect(paramMap.has('test')).toBe(false);
      expect(paramMap.getAll('test')).toEqual([]);
      expect(paramMap.keys).toEqual([]);
    });
  });

  describe('actionsServiceMock', () => {
    it('should have correct structure', () => {
      expect(actionsServiceMock.getActions).toBeDefined();
      expect(actionsServiceMock.getAction).toBeDefined();
      expect(actionsServiceMock.createAction).toBeDefined();
      expect(actionsServiceMock.updateAction).toBeDefined();
      expect(actionsServiceMock.deleteAction).toBeDefined();
      expect(actionsServiceMock.getInitials).toBeDefined();
      expect(actionsServiceMock.updateList).toBeDefined();
      expect(actionsServiceMock.showToast).toBeDefined();
      expect(actionsServiceMock.showGlobalAlert).toBeDefined();
    });

    it('should return correct values from methods', () => {
      expect(actionsServiceMock.getInitials()).toBe('JD');
    });
  });

  describe('apiServiceMock', () => {
    it('should have correct structure', () => {
      expect(apiServiceMock.GET_LatestResults).toBeDefined();
      expect(apiServiceMock.GET_GreenChecks).toBeDefined();
      expect(apiServiceMock.GET_Institutions).toBeDefined();
      expect(apiServiceMock.GET_InstitutionsTypesChildless).toBeDefined();
      expect(apiServiceMock.GET_Countries).toBeDefined();
      expect(apiServiceMock.GET_IndicatorTypes).toBeDefined();
      expect(apiServiceMock.GET_Years).toBeDefined();
      expect(apiServiceMock.GET_Contracts).toBeDefined();
      expect(apiServiceMock.GET_Results).toBeDefined();
      expect(apiServiceMock.GET_IpOwners).toBeDefined();
      expect(apiServiceMock.GET_InstitutionsTypes).toBeDefined();
      expect(apiServiceMock.GET_Languages).toBeDefined();
      expect(apiServiceMock.GET_SessionPurpose).toBeDefined();
      expect(apiServiceMock.GET_SessionType).toBeDefined();
      expect(apiServiceMock.GET_ResultsCount).toBeDefined();
      expect(apiServiceMock.GET_Alignments).toBeDefined();
      expect(apiServiceMock.GET_GeneralInformation).toBeDefined();
      expect(apiServiceMock.DELETE_Result).toBeDefined();
      expect(apiServiceMock.login).toBeDefined();
      expect(apiServiceMock.GET_SessionLength).toBeDefined();
      expect(apiServiceMock.GET_AllResultStatus).toBeDefined();
    });

    it('should return correct mock data', async () => {
      const latestResults = await apiServiceMock.GET_LatestResults();
      expect(latestResults).toBe(mockLatestResults);

      const greenChecks = await apiServiceMock.GET_GreenChecks(123);
      expect(greenChecks).toBe(mockGreenChecks);

      const institutions = await apiServiceMock.GET_Institutions();
      expect(institutions).toBe(mockInstitutions);

      const institutionsTypes = await apiServiceMock.GET_InstitutionsTypes();
      expect(institutionsTypes).toBe(mockInstitutionsTypes);

      const languages = await apiServiceMock.GET_Languages();
      expect(languages).toBe(mockLanguages);

      const sessionPurpose = await apiServiceMock.GET_SessionPurpose();
      expect(sessionPurpose).toBe(mockSessionPurpose);

      const sessionType = await apiServiceMock.GET_SessionType();
      expect(sessionType).toBe(mockSessionTypes);

      const resultsCount = await apiServiceMock.GET_ResultsCount();
      expect(resultsCount).toEqual({ data: { projectDescription: 'Test Project', description: 'Test Description' } });

      const alignments = await apiServiceMock.GET_Alignments();
      expect(alignments).toEqual({ data: { contracts: [{ is_primary: true, contract_id: 'A1048' }] } });

      const generalInformation = await apiServiceMock.GET_GeneralInformation();
      expect(generalInformation).toEqual({ data: { title: 'Test Result Title' } });

      const deleteResult = await apiServiceMock.DELETE_Result();
      expect(deleteResult).toEqual({ successfulRequest: true });

      const ipOwners = await apiServiceMock.GET_IpOwners();
      expect(ipOwners).toEqual({ data: [] });

      const countries = await apiServiceMock.GET_Countries();
      expect(countries).toEqual({ data: [] });

      const indicatorTypes = await apiServiceMock.GET_IndicatorTypes();
      expect(indicatorTypes).toEqual({ data: [] });

      const years = await apiServiceMock.GET_Years();
      expect(years).toEqual({ data: [] });

      const contracts = await apiServiceMock.GET_Contracts();
      expect(contracts).toEqual({ data: [] });

      const results = await apiServiceMock.GET_Results();
      expect(results).toEqual({ data: [] });

      const institutionsTypesChildless = await apiServiceMock.GET_InstitutionsTypesChildless();
      expect(institutionsTypesChildless).toEqual({ data: [] });
    });
  });

  describe('httpClientMock', () => {
    it('should have correct structure', () => {
      expect(httpClientMock.get).toBeDefined();
      expect(httpClientMock.post).toBeDefined();
      expect(httpClientMock.put).toBeDefined();
      expect(httpClientMock.delete).toBeDefined();
      expect(httpClientMock.patch).toBeDefined();
    });
  });

  describe('routerMock', () => {
    it('should have correct structure', () => {
      expect(routerMock.events).toBeDefined();
      expect(routerMock.navigate).toBeDefined();
      expect(routerMock.createUrlTree).toBeDefined();
      expect(routerMock.serializeUrl).toBeDefined();
      expect(routerMock.url).toBe('/test');
    });

    it('should return correct values from methods', async () => {
      const navigateResult = await routerMock.navigate(['/test']);
      expect(navigateResult).toBe(true);

      const urlTree = routerMock.createUrlTree(['/test']);
      expect(urlTree).toEqual({});

      const serializedUrl = routerMock.serializeUrl({} as any);
      expect(serializedUrl).toBe('');
    });
  });

  describe('submissionServiceMock', () => {
    it('should have correct structure', () => {
      expect(submissionServiceMock.statusSelected).toBeDefined();
      expect(submissionServiceMock.comment).toBeDefined();
      expect(submissionServiceMock.getSubmissionHistory).toBeDefined();
      expect(submissionServiceMock.setStatus).toBeDefined();
      expect(submissionServiceMock.setComment).toBeDefined();
      expect(submissionServiceMock.submit).toBeDefined();
    });
  });

  describe('mock data objects', () => {
    it('should have correct mockLatestResults structure', () => {
      expect(mockLatestResults.status).toBe(200);
      expect(mockLatestResults.description).toBe('Success');
      expect(mockLatestResults.timestamp).toBeDefined();
      expect(mockLatestResults.path).toBe('/api/latest-results');
      expect(mockLatestResults.successfulRequest).toBe(true);
      expect(mockLatestResults.errorDetail).toBeDefined();
      expect(mockLatestResults.data).toBeDefined();
    });

    it('should have correct mockGreenChecks structure', () => {
      expect(mockGreenChecks.status).toBe(200);
      expect(mockGreenChecks.description).toBe('Success');
      expect(mockGreenChecks.timestamp).toBeDefined();
      expect(mockGreenChecks.path).toBe('/api/green-checks');
      expect(mockGreenChecks.successfulRequest).toBe(true);
      expect(mockGreenChecks.errorDetail).toBeDefined();
      expect(mockGreenChecks.data).toBeDefined();
    });

    it('should have correct mockInstitutions structure', () => {
      expect(mockInstitutions.status).toBe(200);
      expect(mockInstitutions.description).toBe('Success');
      expect(mockInstitutions.timestamp).toBeDefined();
      expect(mockInstitutions.path).toBe('/api/institutions');
      expect(mockInstitutions.successfulRequest).toBe(true);
      expect(mockInstitutions.errorDetail).toBeDefined();
      expect(mockInstitutions.data).toBeDefined();
    });

    it('should have correct mockInstitutionsTypes structure', () => {
      expect(mockInstitutionsTypes.status).toBe(200);
      expect(mockInstitutionsTypes.description).toBe('Success');
      expect(mockInstitutionsTypes.timestamp).toBeDefined();
      expect(mockInstitutionsTypes.path).toBe('/api/institutions-types');
      expect(mockInstitutionsTypes.successfulRequest).toBe(true);
      expect(mockInstitutionsTypes.errorDetail).toBeDefined();
      expect(mockInstitutionsTypes.data).toBeDefined();
    });

    it('should have correct mockLanguages structure', () => {
      expect(mockLanguages.status).toBe(200);
      expect(mockLanguages.description).toBe('Success');
      expect(mockLanguages.timestamp).toBeDefined();
      expect(mockLanguages.path).toBe('/api/languages');
      expect(mockLanguages.successfulRequest).toBe(true);
      expect(mockLanguages.errorDetail).toBeDefined();
      expect(mockLanguages.data).toBeDefined();
    });

    it('should have correct mockSessionPurpose structure', () => {
      expect(mockSessionPurpose.status).toBe(200);
      expect(mockSessionPurpose.description).toBe('Success');
      expect(mockSessionPurpose.timestamp).toBeDefined();
      expect(mockSessionPurpose.path).toBe('/api/session-purpose');
      expect(mockSessionPurpose.successfulRequest).toBe(true);
      expect(mockSessionPurpose.errorDetail).toBeDefined();
      expect(mockSessionPurpose.data).toBeDefined();
    });

    it('should have correct mockSessionTypes structure', () => {
      expect(mockSessionTypes.status).toBe(200);
      expect(mockSessionTypes.description).toBe('Success');
      expect(mockSessionTypes.timestamp).toBeDefined();
      expect(mockSessionTypes.path).toBe('/api/session-types');
      expect(mockSessionTypes.successfulRequest).toBe(true);
      expect(mockSessionTypes.errorDetail).toBeDefined();
      expect(mockSessionTypes.data).toBeDefined();
    });

    it('should have correct mockResultsStatus structure', () => {
      expect(mockResultsStatus.data).toBeDefined();
      expect(Array.isArray(mockResultsStatus.data)).toBe(true);
    });

    it('should have correct mockIndicatorsResults structure', () => {
      expect(mockIndicatorsResults.data).toBeDefined();
      expect(Array.isArray(mockIndicatorsResults.data)).toBe(true);
    });
  });

  describe('service mocks', () => {
    it('should have correct getMetadataServiceMock structure', () => {
      expect(getMetadataServiceMock.update).toBeDefined();
      expect(getMetadataServiceMock.formatText).toBeDefined();
      expect(getMetadataServiceMock.clearMetadata).toBeDefined();
    });

    it('should return correct values from getMetadataServiceMock methods', () => {
      expect(getMetadataServiceMock.formatText()).toBe('');
    });

    it('should have correct clarityServiceMock structure', () => {
      expect(clarityServiceMock.updateUserInfo).toBeDefined();
    });

    it('should have correct getResultsServiceMock structure', () => {
      expect(getResultsServiceMock.updateList).toBeDefined();
    });

    it('should have correct getUserStaffServiceMock structure', () => {
      expect(getUserStaffServiceMock.getData).toBeDefined();
    });

    it('should return correct values from getUserStaffServiceMock methods', async () => {
      const result = await getUserStaffServiceMock.getData();
      expect(result).toEqual({ data: [] });
    });

    it('should have correct versionWatcherServiceMock structure', () => {
      expect(versionWatcherServiceMock.onVersionChange).toBeDefined();
    });
  });
});
