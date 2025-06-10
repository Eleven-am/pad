// Dashboard Mock Data
export const dashboardData = {
  // Content Performance Metrics
  contentMetrics: {
    postLevel: {
      totalPublished: 127,
      totalDrafts: 23,
      totalScheduled: 8,
      pendingReview: 5,
      featuredPosts: 12,
      seoOptimized: 98,
      avgPublishTime: "2.5 days",
      completionRate: 78,
      recentPosts: {
        last7Days: 5,
        last30Days: 18,
        last90Days: 45
      },
      contentVelocity: {
        weekly: 1.2,
        monthly: 4.5
      }
    },
    individualPosts: {
      topPerforming: [
        {
          id: "post-1",
          title: "The Future of AI in Content Creation",
          views: {
            allTime: 12500,
            monthly: 3200,
            weekly: 850,
            daily: 120
          },
          uniqueVisitors: 9800,
          avgReadTime: "4.2 min",
          bounceRate: 32,
          scrollDepth: 78,
          socialShares: 450,
          comments: 89,
          likes: 320,
          bookmarkRate: 12,
          printDownloads: 45,
          copyActions: 230,
          completionRate: 65
        },
        // Add more posts...
      ]
    },
    qualityIndicators: {
      avgReadingTime: "3.8 min",
      wordCountDistribution: {
        "0-500": 15,
        "501-1000": 35,
        "1001-2000": 30,
        "2001+": 20
      },
      contentFreshness: {
        updatedLastWeek: 25,
        updatedLastMonth: 45,
        updatedLastQuarter: 20,
        older: 10
      },
      seoScores: {
        excellent: 45,
        good: 35,
        average: 15,
        needsImprovement: 5
      },
      readabilityScores: {
        excellent: 60,
        good: 30,
        average: 8,
        needsImprovement: 2
      },
      imageOptimization: 92,
      avgLoadSpeed: "1.2s",
      mobileResponsiveness: 95
    }
  },

  // Block-Specific Analytics
  blockAnalytics: {
    usage: {
      totalBlocks: 1250,
      typeDistribution: {
        text: 35,
        image: 25,
        chart: 15,
        instagram: 10,
        twitter: 8,
        code: 5,
        table: 2
      },
      mostUsed: ["text", "image", "chart"],
      leastUsed: ["table", "code", "twitter"],
      avgBlocksPerPost: 8.5,
      creationTrends: {
        text: [120, 150, 180, 200],
        image: [80, 100, 120, 150],
        chart: [40, 50, 60, 70]
      },
      deletionRate: 5
    },
    performance: {
      clickThroughRates: {
        polls: 45,
        charts: 35,
        tables: 25
      },
      engagementTime: {
        text: "2.5 min",
        image: "1.8 min",
        chart: "3.2 min",
        instagram: "2.1 min",
        twitter: "1.5 min"
      },
      socialMediaFetch: {
        success: 92,
        errors: 8
      },
      chartViewDuration: "2.8 min",
      codeCopyRate: 35,
      imageZoomRate: 45,
      videoPlayRate: 65,
      pollParticipation: 40,
      tableInteraction: 30,
      quoteShareRate: 25
    },
    specificData: {
      instagram: {
        fetchSuccess: 95,
        avgLikes: 320,
        avgComments: 45
      },
      twitter: {
        engagementAccuracy: 90,
        avgRetweets: 120,
        avgLikes: 280
      },
      chart: {
        avgFileSize: "2.5MB",
        typePreferences: {
          bar: 40,
          line: 30,
          pie: 20,
          area: 10
        }
      },
      code: {
        languageDistribution: {
          javascript: 35,
          python: 25,
          typescript: 20,
          java: 15,
          other: 5
        },
        copyRate: 45
      },
      image: {
        avgFileSize: "1.2MB",
        avgLoadTime: "0.8s",
        altTextCompletion: 85
      },
      video: {
        avgFileSize: "15MB",
        posterOptimization: 90
      },
      table: {
        avgRows: 12,
        avgColumns: 6,
        mobileLayoutUsage: 75
      }
    }
  },

  // Audience & User Engagement
  audience: {
    demographics: {
      totalVisitors: {
        allTime: 125000,
        monthly: 25000,
        weekly: 6000
      },
      returningVsNew: {
        returning: 65,
        new: 35
      },
      geographic: {
        northAmerica: 45,
        europe: 30,
        asia: 15,
        other: 10
      },
      ageGroups: {
        "18-24": 20,
        "25-34": 35,
        "35-44": 25,
        "45-54": 15,
        "55+": 5
      },
      geographicDistribution: {
        "North America": 45,
        "Europe": 30,
        "Asia": 15,
        "Other": 10
      },
      deviceUsage: {
        "Mobile": 55,
        "Desktop": 40,
        "Tablet": 5
      },
      devices: {
        mobile: 55,
        desktop: 40,
        tablet: 5
      },
      browsers: {
        chrome: 60,
        safari: 25,
        firefox: 10,
        other: 5
      },
      operatingSystems: {
        windows: 40,
        macos: 35,
        ios: 15,
        android: 10
      },
      screenResolutions: {
        "1920x1080": 30,
        "1366x768": 25,
        "375x812": 20,
        other: 25
      },
      peakHours: {
        "9-12": 25,
        "12-15": 30,
        "15-18": 20,
        "18-21": 15,
        other: 10
      }
    },
    engagement: {
      avgSessionDuration: 3.5,
      pagesPerSession: 2.8,
      commentRate: 5,
      socialReferrals: 25,
      bounceRate: 35,
      returnRate: 65,
      shareRate: 15,
      likeRate: 25,
      avgPagesPerVisit: 3.2,
      trafficSources: {
        direct: 40,
        search: 35,
        social: 20,
        referral: 5
      },
      exitPages: {
        "post-1": 15,
        "post-2": 12,
        "post-3": 10
      },
      searchTerms: [
        "content creation",
        "blog writing",
        "social media",
        "data visualization"
      ],
      emailSubscription: 8,
      newsletterOpenRate: 45,
      peakHours: {
        "9-12": 25,
        "12-15": 30,
        "15-18": 20,
        "18-21": 15,
        other: 10
      },
      contentPreferences: {
        technology: 35,
        marketing: 25,
        design: 20,
        other: 20
      }
    }
  },

  // Publishing & Workflow
  publishing: {
    pipeline: {
      draft: 23,
      review: 5,
      scheduled: 8,
      published: 127
    },
    workflow: {
      avgDraftTime: "3.2 days",
      avgReviewTime: "1.5 days",
      avgPublishTime: "0.5 days",
      bottlenecks: {
        review: 35,
        content: 25,
        technical: 20,
        other: 20
      },
      authorProductivity: {
        "author-1": 45,
        "author-2": 35,
        "author-3": 20
      },
      reviewTimes: {
        "reviewer-1": "1.2 days",
        "reviewer-2": "1.8 days",
        "reviewer-3": "2.1 days"
      },
      scheduleAdherence: 85,
      calendarCompletion: 90
    },
    timing: {
      optimalPublishing: {
        monday: 25,
        tuesday: 20,
        wednesday: 15,
        thursday: 20,
        friday: 15,
        weekend: 5
      },
      scheduledQueue: {
        nextWeek: 5,
        nextMonth: 3
      },
      publishingFrequency: {
        daily: 0,
        weekly: 3,
        biweekly: 2,
        monthly: 1
      },
      seasonalPerformance: {
        spring: 25,
        summer: 20,
        fall: 30,
        winter: 25
      },
      timeToEngagement: "2.5 hours",
      contentShelfLife: "45 days"
    }
  },

  // Social Media Integration
  socialMedia: {
    platformPerformance: {
      instagram: {
        successRate: 92,
        errorTypes: {
          api: 5,
          network: 2,
          other: 1
        }
      },
      twitter: {
        creationFrequency: 15,
        successRate: 95
      },
      contentPerformance: {
        withSocial: 35,
        withoutSocial: 25
      },
      blockEngagement: {
        instagram: 30,
        twitter: 25,
        other: 45
      },
      failedFetches: {
        instagram: 8,
        twitter: 5
      },
      contentFreshness: {
        "0-24h": 45,
        "24-48h": 30,
        "48h+": 25
      },
      platformEngagement: {
        instagram: 35,
        twitter: 30,
        facebook: 20,
        linkedin: 15
      }
    },
    roi: {
      socialVsOriginal: {
        withSocial: 35,
        withoutSocial: 25
      },
      socialProofImpact: 40,
      crossPlatform: {
        instagram: 35,
        twitter: 30,
        facebook: 20,
        linkedin: 15
      },
      loadingTimes: {
        instagram: "1.2s",
        twitter: "0.8s"
      },
      apiSuccess: 95,
      apiCosts: "$120/month"
    }
  },

  // SEO & Discovery
  seo: {
    search: {
      organicTraffic: 45000,
      rankingPositions: {
        "1-3": 15,
        "4-10": 25,
        "11-20": 30,
        "21+": 30
      },
      ctr: 3.5,
      impressions: 125000,
      featuredSnippets: 12,
      internalLinking: 85,
      backlinks: 250,
      metaOptimization: 90
    },
    discoverability: {
      tagEffectiveness: 75,
      categoryPerformance: {
        technology: 35,
        marketing: 25,
        design: 20,
        other: 20
      },
      relatedPostCtr: 15,
      searchUsage: 25,
      recommendationAccuracy: 80,
      rssSubscriptions: 1200
    }
  },

  // Technical Performance
  technical: {
    site: {
      avgLoadSpeed: "1.2s",
      coreWebVitals: {
        lcp: "1.5s",
        fid: "0.1s",
        cls: 0.1
      },
      mobileScore: 95,
      imageOptimization: 90,
      cdnEffectiveness: 85,
      cacheHitRate: 75,
      apiResponseTime: "0.3s",
      databasePerformance: "0.2s",
      errorRate: 0.5
    },
    health: {
      uptime: 99.9,
      failedBlocks: 5,
      uploadSuccess: 98,
      storageUsage: "2.5GB",
      bandwidth: "50GB/month",
      databaseSize: "1.2GB",
      backupStatus: "success",
      securityScore: 95
    }
  },

  // Business & Growth
  business: {
    monetization: {
      revenuePerPost: "$120",
      adPerformance: {
        display: 35,
        native: 25,
        video: 20,
        other: 20
      },
      subscriptionRate: 5,
      premiumEngagement: 15,
      affiliatePerformance: 25,
      sponsorEffectiveness: 30
    },
    growth: {
      emailList: 15,
      socialFollowers: 25,
      referralTraffic: 20,
      brandMentions: 45,
      syndication: 15,
      partnerships: 20
    }
  },

  // Collaboration & Team
  collaboration: {
    authors: {
      productivity: {
        "author-1": 45,
        "author-2": 35,
        "author-3": 20
      },
      contributions: {
        "author-1": 40,
        "author-2": 35,
        "author-3": 25
      },
      engagement: {
        "author-1": 35,
        "author-2": 30,
        "author-3": 25
      }
    },
    workflow: {
      revisions: {
        "post-1": 3,
        "post-2": 2,
        "post-3": 4
      },
      collaboration: {
        "post-1": 2,
        "post-2": 3,
        "post-3": 1
      },
      reviewCompletion: 90,
      calendarAdherence: 85,
      qualityConsistency: 80
    }
  },

  // Content Strategy
  strategy: {
    contentType: {
      byLength: {
        short: 25,
        medium: 45,
        long: 30
      },
      blockCombinations: {
        "text+image": 35,
        "text+chart": 25,
        "text+social": 20,
        other: 20
      },
      topicTrending: {
        technology: 35,
        marketing: 25,
        design: 20,
        other: 20
      },
      seasonal: {
        spring: 25,
        summer: 20,
        fall: 30,
        winter: 25
      },
      series: {
        performance: 35,
        engagement: 30,
        completion: 25
      },
      evergreen: {
        performance: 40,
        engagement: 35,
        shelfLife: "365 days"
      }
    },
    audienceBehavior: {
      readingPreferences: {
        morning: 35,
        afternoon: 40,
        evening: 25
      },
      devicePreferences: {
        mobile: 55,
        desktop: 40,
        tablet: 5
      },
      geographic: {
        northAmerica: 45,
        europe: 30,
        asia: 15,
        other: 10
      },
      returning: {
        preferences: {
          technology: 35,
          marketing: 25,
          design: 20,
          other: 20
        }
      }
    }
  },

  // Predictive & Recommendations
  predictive: {
    recommendations: {
      trendingTopics: [
        "AI in content creation",
        "Social media strategy",
        "Data visualization"
      ],
      optimalPosting: {
        monday: "9:00 AM",
        tuesday: "10:00 AM",
        wednesday: "11:00 AM",
        thursday: "2:00 PM",
        friday: "3:00 PM"
      },
      contentGaps: [
        "Video content",
        "Case studies",
        "Tutorials"
      ],
      blockRecommendations: [
        "Add more charts",
        "Include social proof",
        "Use more images"
      ],
      seoSuggestions: [
        "Improve meta descriptions",
        "Add more internal links",
        "Optimize headings"
      ],
      performancePredictions: {
        "post-1": 85,
        "post-2": 75,
        "post-3": 90
      }
    },
    alerts: {
      performance: [
        "Post engagement dropped 20%",
        "Bounce rate increased 15%",
        "Loading speed decreased"
      ],
      technical: [
        "API errors increased",
        "Storage usage high",
        "Backup failed"
      ],
      publishing: [
        "Schedule conflict",
        "Review overdue",
        "Draft incomplete"
      ],
      seo: [
        "Ranking dropped",
        "Meta description missing",
        "Internal links needed"
      ],
      engagement: [
        "Comments increased",
        "Shares decreased",
        "Time on page low"
      ],
      maintenance: [
        "System update needed",
        "Security scan due",
        "Backup required"
      ]
    }
  },

  // Comparative Analytics
  comparative: {
    performance: {
      vsPrevious: {
        views: 15,
        engagement: 20,
        conversion: 10
      },
      contentTypes: {
        text: 35,
        image: 25,
        video: 20,
        social: 20
      },
      authors: {
        "author-1": 45,
        "author-2": 35,
        "author-3": 20
      },
      blocks: {
        text: 35,
        image: 25,
        chart: 20,
        social: 20
      },
      seasonal: {
        spring: 25,
        summer: 20,
        fall: 30,
        winter: 25
      },
      industry: {
        views: 85,
        engagement: 90,
        conversion: 80
      }
    }
  }
}; 