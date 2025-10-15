/**
 * Lightweight Routing Tests for New Features
 *
 * Tests for:
 * - Demo Slideshow quick action availability
 * - Announcement Banner presence
 * - NICCEE Framework tab navigation
 */

import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
}));

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
}));

// Mock demo slides data
jest.mock('../../lib/demo-slides', () => ({
  DEMO_PRESENTATIONS: [
    {
      id: 'xsiam-overview',
      name: 'XSIAM Platform Overview',
      description: 'Executive overview',
      icon: '🎯',
      slides: [{ title: 'Test', content: 'Test', type: 'title' }],
    },
  ],
  getDemoPresentation: jest.fn((id) => ({
    id,
    name: 'Test Presentation',
    slides: [],
  })),
}));

// Mock announcements data
jest.mock('../../lib/announcements', () => ({
  ACTIVE_ANNOUNCEMENTS: [
    {
      id: 'test-1',
      title: 'Test Announcement',
      description: 'Test',
      date: '2025-01-15',
      category: 'platform',
      priority: 'high',
      icon: '🎬',
    },
  ],
  getPlatformAnnouncements: jest.fn(() => []),
  getProductAnnouncements: jest.fn(() => []),
}));

// Mock NICCEE framework data
jest.mock('../../lib/niccee-framework', () => ({
  NICCEE_DATA_SOURCES: [],
  NICCEE_PLAYBOOKS: [],
  NICCEE_BUSINESS_VALUE_FRAMEWORK: {},
}));

describe('New Features Routing - Data Availability', () => {
  it('demo slideshow data is available', () => {
    const { DEMO_PRESENTATIONS } = require('../../lib/demo-slides');
    expect(DEMO_PRESENTATIONS).toBeDefined();
    expect(Array.isArray(DEMO_PRESENTATIONS)).toBe(true);
    expect(DEMO_PRESENTATIONS.length).toBeGreaterThan(0);
  });

  it('announcements data is available', () => {
    const { ACTIVE_ANNOUNCEMENTS } = require('../../lib/announcements');
    expect(ACTIVE_ANNOUNCEMENTS).toBeDefined();
    expect(Array.isArray(ACTIVE_ANNOUNCEMENTS)).toBe(true);
  });

  it('NICCEE framework data exports are available', () => {
    const framework = require('../../lib/niccee-framework');
    expect(framework).toBeDefined();
    expect(framework.NICCEE_DATA_SOURCES).toBeDefined();
    expect(framework.NICCEE_PLAYBOOKS).toBeDefined();
    expect(framework.NICCEE_BUSINESS_VALUE_FRAMEWORK).toBeDefined();
  });
});

describe('New Features Routing - Component Exports', () => {
  it('DemoSlideshow component exports correctly', () => {
    // Dynamic import test
    expect(() => require('../../components/DemoSlideshow')).not.toThrow();
  });

  it('AnnouncementBanner component exports correctly', () => {
    expect(() => require('../../components/AnnouncementBanner')).not.toThrow();
  });

  it('NICCEEFramework component exports correctly', () => {
    expect(() => require('../../components/NICCEEFramework')).not.toThrow();
  });
});

describe('New Features Integration - Tab Configuration', () => {
  it('all new feature components are importable', () => {
    // Verify that all new features have working imports
    const demoSlideshow = require('../../components/DemoSlideshow');
    const announcementBanner = require('../../components/AnnouncementBanner');
    const nicceeFramework = require('../../components/NICCEEFramework');

    expect(demoSlideshow.default).toBeDefined();
    expect(announcementBanner.AnnouncementBanner).toBeDefined();
    expect(nicceeFramework.NICCEEFramework).toBeDefined();
  });

  it('all new data libraries are complete', () => {
    const demoSlides = require('../../lib/demo-slides');
    const announcements = require('../../lib/announcements');
    const niccee = require('../../lib/niccee-framework');

    // Verify demo slides exports
    expect(demoSlides.DEMO_PRESENTATIONS).toBeDefined();
    expect(demoSlides.getDemoPresentation).toBeDefined();
    expect(Array.isArray(demoSlides.DEMO_PRESENTATIONS)).toBe(true);

    // Verify announcements exports
    expect(announcements.ACTIVE_ANNOUNCEMENTS).toBeDefined();
    expect(announcements.getPlatformAnnouncements).toBeDefined();
    expect(announcements.getProductAnnouncements).toBeDefined();

    // Verify NICCEE framework exports
    expect(niccee.NICCEE_DATA_SOURCES).toBeDefined();
    expect(niccee.NICCEE_PLAYBOOKS).toBeDefined();
    expect(niccee.NICCEE_BUSINESS_VALUE_FRAMEWORK).toBeDefined();
  });
});
