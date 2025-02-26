import type { ArtistType } from "./types";

// Define which questions are primary for each artist type
export const primaryQuestions: Record<ArtistType, string[]> = {
  "The Visionary Artist": ["1", "30", "31", "33", "48"],
  "The Consummate Artist": ["4", "6", "15", "20", "21"],
  "The Analyzer Artist": ["7", "8", "13", "23", "24"],
  "The Tech Artist": ["2", "10", "19", "27", "42"],
  "The Entertainer Artist": ["29", "32", "39", "40", "41"],
  "The Maverick Artist": ["9", "11", "26", "45", "50"],
  "The Dreamer Artist": ["5", "16", "18", "37", "43"],
  "The Feeler Artist": ["3", "12", "34", "36", "46"],
  "The Tortured Artist": ["14", "17", "22", "25", "49"],
  "The Solo Artist": ["28", "35", "38", "44", "47"],
};

interface IdealAnswerData {
  values: number[];
  primary: boolean;
}

type ArtistTypeAnswers = Record<string, IdealAnswerData>;

export const artistTypeIdealAnswers: Record<ArtistType, ArtistTypeAnswers> = {
  "The Visionary Artist": {
    "1": { values: [9, 10], primary: true }, // Structured environment
    "2": { values: [5], primary: false }, // Experimenting
    "3": { values: [4], primary: false }, // Nature inspiration
    "4": { values: [6], primary: false }, // Planning
    "5": { values: [3], primary: false }, // Multiple projects
    "6": { values: [7], primary: false }, // Working alone
    "7": { values: [4], primary: false }, // Bold colors
    "8": { values: [5], primary: false }, // Precision
    "9": { values: [3], primary: false }, // Breaking rules
    "10": { values: [6], primary: false }, // Abstract concepts
    "11": { values: [5], primary: false }, // Complete one project
    "12": { values: [7], primary: false }, // Current trends
    "13": { values: [4], primary: false }, // Digital tools
    "14": { values: [3], primary: false }, // Traditional mediums
    "15": { values: [6], primary: false }, // Urban environments
    "16": { values: [5], primary: false }, // Problem-solving
    "17": { values: [4], primary: false }, // Spontaneous creation
    "18": { values: [7], primary: false }, // Minimalist aesthetics
    "19": { values: [3], primary: false }, // Typography
    "20": { values: [6], primary: false }, // Historical art
    "21": { values: [5], primary: false }, // Quiet environment
    "22": { values: [4], primary: false }, // Collaborative projects
    "23": { values: [7], primary: false }, // Music influence
    "24": { values: [3], primary: false }, // Symmetry and balance
    "25": { values: [6], primary: false }, // Unconventional materials
    "26": { values: [5], primary: false }, // Personal experiences
    "27": { values: [4], primary: false }, // Large scale
    "28": { values: [7], primary: false }, // Detailed work
    "29": { values: [3], primary: false }, // Monochromatic
    "30": { values: [9, 10], primary: true }, // Social issues
    "31": { values: [9, 10], primary: true }, // Limited palette
    "32": { values: [6], primary: false }, // Mixed media
    "33": { values: [9, 10], primary: true }, // Cultural traditions
    "34": { values: [5], primary: false }, // Commissioned projects
    "35": { values: [4], primary: false }, // Series or collections
    "36": { values: [7], primary: false }, // Dreams and imagination
    "37": { values: [3], primary: false }, // Natural light
    "38": { values: [6], primary: false }, // Functional art
    "39": { values: [5], primary: false }, // Geometric patterns
    "40": { values: [4], primary: false }, // Literature inspiration
    "41": { values: [7], primary: false }, // Specific medium
    "42": { values: [3], primary: false }, // Experimental techniques
    "43": { values: [6], primary: false }, // Emotional states
    "44": { values: [5], primary: false }, // Small-scale projects
    "45": { values: [4], primary: false }, // Narrative works
    "46": { values: [7], primary: false }, // Architectural forms
    "47": { values: [3], primary: false }, // Organic shapes
    "48": { values: [9, 10], primary: true }, // Interactive art
    "49": { values: [6], primary: false }, // Texture and tactile
    "50": { values: [5], primary: false }, // Scientific concepts
  },
  "The Consummate Artist": {
    "1": { values: [3], primary: false }, // Structured environment
    "2": { values: [6], primary: false }, // Experimenting
    "3": { values: [4], primary: false }, // Nature inspiration
    "4": { values: [9, 10], primary: true }, // Planning
    "5": { values: [7], primary: false }, // Multiple projects
    "6": { values: [9, 10], primary: true }, // Working alone
    "7": { values: [3], primary: false }, // Bold colors
    "8": { values: [6], primary: false }, // Precision
    "9": { values: [4], primary: false }, // Breaking rules
    "10": { values: [7], primary: false }, // Abstract concepts
    "11": { values: [3], primary: false }, // Complete one project
    "12": { values: [6], primary: false }, // Current trends
    "13": { values: [4], primary: false }, // Digital tools
    "14": { values: [7], primary: false }, // Traditional mediums
    "15": { values: [9, 10], primary: true }, // Urban environments
    "16": { values: [3], primary: false }, // Problem-solving
    "17": { values: [6], primary: false }, // Spontaneous creation
    "18": { values: [4], primary: false }, // Minimalist aesthetics
    "19": { values: [7], primary: false }, // Typography
    "20": { values: [9, 10], primary: true }, // Historical art
    "21": { values: [9, 10], primary: true }, // Quiet environment
    "22": { values: [3], primary: false }, // Collaborative projects
    "23": { values: [6], primary: false }, // Music influence
    "24": { values: [4], primary: false }, // Symmetry
    "25": { values: [7], primary: false }, // Unconventional materials
    "26": { values: [3], primary: false }, // Personal experiences
    "27": { values: [6], primary: false }, // Large scale
    "28": { values: [4], primary: false }, // Detailed work
    "29": { values: [7], primary: false }, // Monochromatic
    "30": { values: [3], primary: false }, // Social issues
    "31": { values: [6], primary: false }, // Limited palette
    "32": { values: [4], primary: false }, // Mixed media
    "33": { values: [7], primary: false }, // Cultural traditions
    "34": { values: [3], primary: false }, // Commissioned projects
    "35": { values: [6], primary: false }, // Series or collections
    "36": { values: [4], primary: false }, // Dreams and imagination
    "37": { values: [7], primary: false }, // Natural light
    "38": { values: [3], primary: false }, // Functional art
    "39": { values: [6], primary: false }, // Geometric patterns
    "40": { values: [4], primary: false }, // Literature inspiration
    "41": { values: [7], primary: false }, // Specific medium
    "42": { values: [3], primary: false }, // Experimental techniques
    "43": { values: [6], primary: false }, // Emotional states
    "44": { values: [4], primary: false }, // Small-scale projects
    "45": { values: [7], primary: false }, // Narrative works
    "46": { values: [3], primary: false }, // Architectural forms
    "47": { values: [6], primary: false }, // Organic shapes
    "48": { values: [4], primary: false }, // Interactive art
    "49": { values: [7], primary: false }, // Texture
    "50": { values: [9, 10], primary: true }, // Scientific concepts
  },
  "The Analyzer Artist": {
    "1": { values: [4], primary: false }, // Structured environment
    "2": { values: [7], primary: false }, // Experimenting
    "3": { values: [3], primary: false }, // Nature inspiration
    "4": { values: [6], primary: false }, // Planning
    "5": { values: [4], primary: false }, // Multiple projects
    "6": { values: [7], primary: false }, // Working alone
    "7": { values: [9, 10], primary: true }, // Bold colors
    "8": { values: [9, 10], primary: true }, // Precision
    "9": { values: [3], primary: false }, // Breaking rules
    "10": { values: [6], primary: false }, // Abstract concepts
    "11": { values: [4], primary: false }, // Complete one project
    "12": { values: [7], primary: false }, // Current trends
    "13": { values: [9, 10], primary: true }, // Digital tools
    "14": { values: [3], primary: false }, // Traditional mediums
    "15": { values: [6], primary: false }, // Urban environments
    "16": { values: [4], primary: false }, // Problem-solving
    "17": { values: [7], primary: false }, // Spontaneous creation
    "18": { values: [3], primary: false }, // Minimalist aesthetics
    "19": { values: [6], primary: false }, // Typography
    "20": { values: [4], primary: false }, // Historical art
    "21": { values: [7], primary: false }, // Quiet environment
    "22": { values: [9, 10], primary: true }, // Collaborative projects
    "23": { values: [9, 10], primary: true }, // Music influence
    "24": { values: [9, 10], primary: true }, // Symmetry
    "25": { values: [3], primary: false }, // Unconventional materials
    "26": { values: [6], primary: false }, // Personal experiences
    "27": { values: [4], primary: false }, // Large scale
    "28": { values: [7], primary: false }, // Detailed work
    "29": { values: [3], primary: false }, // Monochromatic
    "30": { values: [6], primary: false }, // Social issues
    "31": { values: [4], primary: false }, // Limited palette
    "32": { values: [7], primary: false }, // Mixed media
    "33": { values: [3], primary: false }, // Cultural traditions
    "34": { values: [6], primary: false }, // Commissioned projects
    "35": { values: [4], primary: false }, // Series or collections
    "36": { values: [7], primary: false }, // Dreams and imagination
    "37": { values: [3], primary: false }, // Natural light
    "38": { values: [6], primary: false }, // Functional art
    "39": { values: [4], primary: false }, // Geometric patterns
    "40": { values: [7], primary: false }, // Literature inspiration
    "41": { values: [3], primary: false }, // Specific medium
    "42": { values: [6], primary: false }, // Experimental techniques
    "43": { values: [4], primary: false }, // Emotional states
    "44": { values: [7], primary: false }, // Small-scale projects
    "45": { values: [3], primary: false }, // Narrative works
    "46": { values: [6], primary: false }, // Architectural forms
    "47": { values: [4], primary: false }, // Organic shapes
    "48": { values: [7], primary: false }, // Interactive art
    "49": { values: [3], primary: false }, // Texture
    "50": { values: [9, 10], primary: true }, // Scientific concepts
  },
  "The Tech Artist": {
    "1": { values: [5], primary: false }, // Structured environment
    "2": { values: [9, 10], primary: true }, // Experimenting
    "3": { values: [3], primary: false }, // Nature inspiration
    "4": { values: [7], primary: false }, // Planning
    "5": { values: [4], primary: false }, // Multiple projects
    "6": { values: [6], primary: false }, // Working alone
    "7": { values: [5], primary: false }, // Bold colors
    "8": { values: [3], primary: false }, // Precision
    "9": { values: [7], primary: false }, // Breaking rules
    "10": { values: [9, 10], primary: true }, // Abstract concepts
    "11": { values: [4], primary: false }, // Complete one project
    "12": { values: [6], primary: false }, // Current trends
    "13": { values: [5], primary: false }, // Digital tools
    "14": { values: [3], primary: false }, // Traditional mediums
    "15": { values: [7], primary: false }, // Urban environments
    "16": { values: [4], primary: false }, // Problem-solving
    "17": { values: [6], primary: false }, // Spontaneous creation
    "18": { values: [5], primary: false }, // Minimalist aesthetics
    "19": { values: [9, 10], primary: true }, // Typography
    "20": { values: [3], primary: false }, // Historical art
    "21": { values: [7], primary: false }, // Quiet environment
    "22": { values: [4], primary: false }, // Collaborative projects
    "23": { values: [6], primary: false }, // Music influence
    "24": { values: [5], primary: false }, // Symmetry
    "25": { values: [3], primary: false }, // Unconventional materials
    "26": { values: [7], primary: false }, // Personal experiences
    "27": { values: [9, 10], primary: true }, // Large scale
    "28": { values: [4], primary: false }, // Detailed work
    "29": { values: [6], primary: false }, // Monochromatic
    "30": { values: [5], primary: false }, // Social issues
    "31": { values: [3], primary: false }, // Limited palette
    "32": { values: [7], primary: false }, // Mixed media
    "33": { values: [4], primary: false }, // Cultural traditions
    "34": { values: [6], primary: false }, // Commissioned projects
    "35": { values: [5], primary: false }, // Series or collections
    "36": { values: [3], primary: false }, // Dreams and imagination
    "37": { values: [7], primary: false }, // Natural light
    "38": { values: [4], primary: false }, // Functional art
    "39": { values: [6], primary: false }, // Geometric patterns
    "40": { values: [5], primary: false }, // Literature inspiration
    "41": { values: [3], primary: false }, // Specific medium
    "42": { values: [9, 10], primary: true }, // Experimental techniques
    "43": { values: [9, 10], primary: true }, // Emotional states
    "44": { values: [4], primary: false }, // Small-scale projects
    "45": { values: [6], primary: false }, // Narrative works
    "46": { values: [5], primary: false }, // Architectural forms
    "47": { values: [3], primary: false }, // Organic shapes
    "48": { values: [7], primary: false }, // Interactive art
    "49": { values: [4], primary: false }, // Texture
    "50": { values: [9, 10], primary: true }, // Scientific concepts
  },
  "The Entertainer Artist": {
    "1": { values: [2], primary: false }, // Structured environment
    "2": { values: [3], primary: false }, // Experimenting
    "3": { values: [1], primary: false }, // Nature inspiration
    "4": { values: [5], primary: false }, // Planning
    "5": { values: [4], primary: false }, // Multiple projects
    "6": { values: [0, 1, 2], primary: false }, // Working alone (low value preferred)
    "7": { values: [3], primary: false }, // Bold colors
    "8": { values: [1], primary: false }, // Precision
    "9": { values: [0], primary: false }, // Breaking rules
    "10": { values: [2], primary: false }, // Abstract concepts
    "11": { values: [4], primary: false }, // Complete one project
    "12": { values: [3], primary: false }, // Current trends
    "13": { values: [1], primary: false }, // Digital tools
    "14": { values: [5], primary: false }, // Traditional mediums
    "15": { values: [2], primary: false }, // Urban environments
    "16": { values: [3], primary: false }, // Problem-solving
    "17": { values: [1], primary: false }, // Spontaneous creation
    "18": { values: [4], primary: false }, // Minimalist aesthetics
    "19": { values: [1], primary: false }, // Typography
    "20": { values: [4], primary: false }, // Historical art
    "21": { values: [0, 1, 2], primary: false }, // Quiet environment (low value preferred)
    "22": { values: [3], primary: false }, // Collaborative projects
    "23": { values: [1], primary: false }, // Music influence
    "24": { values: [5], primary: false }, // Symmetry
    "25": { values: [4], primary: false }, // Unconventional materials
    "26": { values: [0], primary: false }, // Personal experiences
    "27": { values: [2], primary: false }, // Large scale
    "28": { values: [3], primary: false }, // Detailed work
    "29": { values: [9, 10], primary: true }, // Monochromatic
    "30": { values: [4], primary: false }, // Social issues
    "31": { values: [2], primary: false }, // Limited palette
    "32": { values: [9, 10], primary: true }, // Mixed media
    "33": { values: [3], primary: false }, // Cultural traditions
    "34": { values: [1], primary: false }, // Commissioned projects
    "35": { values: [2], primary: false }, // Series or collections
    "36": { values: [3], primary: false }, // Dreams and imagination
    "37": { values: [1], primary: false }, // Natural light
    "38": { values: [4], primary: false }, // Functional art
    "39": { values: [9, 10], primary: true }, // Geometric patterns
    "40": { values: [9, 10], primary: true }, // Literature inspiration
    "41": { values: [9, 10], primary: true }, // Specific medium
    "42": { values: [1], primary: false }, // Experimental techniques
    "43": { values: [1], primary: false }, // Emotional states
    "44": { values: [4], primary: false }, // Small-scale projects
    "45": { values: [5], primary: false }, // Narrative works
    "46": { values: [9, 10], primary: true }, // Architectural forms
    "47": { values: [3], primary: false }, // Organic shapes
    "48": { values: [1], primary: false }, // Interactive art
    "49": { values: [2], primary: false }, // Texture
    "50": { values: [3], primary: false }, // Scientific concepts
  },
  "The Maverick Artist": {
    "1": { values: [2], primary: false }, // Structured environment
    "2": { values: [3], primary: false }, // Experimenting
    "3": { values: [1], primary: false }, // Nature inspiration
    "4": { values: [0, 1, 2], primary: false }, // Planning (low value preferred)
    "5": { values: [4], primary: false }, // Multiple projects
    "6": { values: [2], primary: false }, // Working alone
    "7": { values: [3], primary: false }, // Bold colors
    "8": { values: [0, 1, 2], primary: false }, // Precision (low value preferred)
    "9": { values: [9, 10], primary: true }, // Breaking rules
    "10": { values: [4], primary: false }, // Abstract concepts
    "11": { values: [9, 10], primary: true }, // Complete one project
    "12": { values: [1], primary: false }, // Current trends
    "13": { values: [2], primary: false }, // Digital tools
    "14": { values: [3], primary: false }, // Traditional mediums
    "15": { values: [4], primary: false }, // Urban environments
    "16": { values: [1], primary: false }, // Problem-solving
    "17": { values: [2], primary: false }, // Spontaneous creation
    "18": { values: [9, 10], primary: true }, // Personal experiences
    "19": { values: [4], primary: false }, // Large scale
    "20": { values: [1], primary: false }, // Detailed work
    "21": { values: [3], primary: false }, // Monochromatic
    "22": { values: [0, 1, 2], primary: false }, // Historical art (low value preferred)
    "23": { values: [1], primary: false }, // Quiet environment
    "24": { values: [3], primary: false }, // Collaborative projects
    "25": { values: [4], primary: false }, // Music influence
    "26": { values: [9, 10], primary: true }, // Series or collections
    "27": { values: [2], primary: false }, // Dreams and imagination
    "28": { values: [3], primary: false }, // Natural light
    "29": { values: [4], primary: false }, // Geometric patterns
    "30": { values: [1], primary: false }, // Literature inspiration
    "31": { values: [2], primary: false }, // Specific medium
    "32": { values: [1], primary: false }, // Experimental techniques
    "33": { values: [3], primary: false }, // Emotional states
    "34": { values: [4], primary: false }, // Small-scale projects
    "35": { values: [9, 10], primary: true }, // Narrative works
    "36": { values: [5], primary: false }, // Architectural forms
    "37": { values: [1], primary: false }, // Organic shapes
    "38": { values: [2], primary: false }, // Interactive art
    "39": { values: [3], primary: false }, // Texture
    "40": { values: [9, 10], primary: true }, // Scientific concepts
  },
  "The Dreamer Artist": {
    "1": { values: [2], primary: false }, // Structured environment
    "2": { values: [3], primary: false }, // Experimenting
    "3": { values: [1], primary: false }, // Nature inspiration
    "4": { values: [5], primary: false }, // Planning
    "5": { values: [9, 10], primary: true }, // Multiple projects
    "6": { values: [2], primary: false }, // Working alone
    "7": { values: [3], primary: false }, // Bold colors
    "8": { values: [4], primary: false }, // Precision
    "9": { values: [1], primary: false }, // Breaking rules
    "10": { values: [2], primary: false }, // Abstract concepts
    "11": { values: [3], primary: false }, // Complete one project
    "12": { values: [1], primary: false }, // Current trends
    "13": { values: [4], primary: false }, // Digital tools
    "14": { values: [5], primary: false }, // Traditional mediums
    "15": { values: [2], primary: false }, // Urban environments
    "16": { values: [9, 10], primary: true }, // Problem-solving
    "17": { values: [1], primary: false }, // Spontaneous creation
    "18": { values: [9, 10], primary: true }, // Minimalist aesthetics
    "19": { values: [4], primary: false }, // Typography
    "20": { values: [3], primary: false }, // Historical art
    "21": { values: [2], primary: false }, // Quiet environment
    "22": { values: [1], primary: false }, // Collaborative projects
    "23": { values: [3], primary: false }, // Music influence
    "24": { values: [5], primary: false }, // Symmetry
    "25": { values: [4], primary: false }, // Unconventional materials
    "26": { values: [0], primary: false }, // Personal experiences
    "27": { values: [2], primary: false }, // Large scale
    "28": { values: [3], primary: false }, // Detailed work
    "29": { values: [1], primary: false }, // Monochromatic
    "30": { values: [4], primary: false }, // Social issues
    "31": { values: [2], primary: false }, // Limited palette
    "32": { values: [5], primary: false }, // Mixed media
    "33": { values: [4], primary: false }, // Cultural traditions
    "34": { values: [1], primary: false }, // Commissioned projects
    "35": { values: [2], primary: false }, // Series or collections
    "36": { values: [3], primary: false }, // Dreams and imagination
    "37": { values: [9, 10], primary: true }, // Natural light
    "38": { values: [4], primary: false }, // Functional art
    "39": { values: [1], primary: false }, // Geometric patterns
    "40": { values: [2], primary: false }, // Literature inspiration
    "41": { values: [3], primary: false }, // Specific medium
    "42": { values: [9, 10], primary: true }, // Experimental techniques
    "43": { values: [1], primary: false }, // Emotional states
    "44": { values: [4], primary: false }, // Small-scale projects
    "45": { values: [5], primary: false }, // Narrative works
    "46": { values: [9, 10], primary: true }, // Architectural forms
    "47": { values: [3], primary: false }, // Organic shapes
    "48": { values: [1], primary: false }, // Interactive art
    "49": { values: [2], primary: false }, // Texture
    "50": { values: [3], primary: false }, // Scientific concepts
  },
  "The Feeler Artist": {
    "1": { values: [2], primary: false }, // Structured environment
    "2": { values: [3], primary: false }, // Experimenting
    "3": { values: [9, 10], primary: true }, // Nature inspiration
    "4": { values: [5], primary: false }, // Planning
    "5": { values: [4], primary: false }, // Multiple projects
    "6": { values: [2], primary: false }, // Working alone
    "7": { values: [3], primary: false }, // Bold colors
    "8": { values: [4], primary: false }, // Precision
    "9": { values: [1], primary: false }, // Breaking rules
    "10": { values: [2], primary: false }, // Abstract concepts
    "11": { values: [3], primary: false }, // Complete one project
    "12": { values: [9, 10], primary: true }, // Current trends
    "13": { values: [1], primary: false }, // Digital tools
    "14": { values: [5], primary: false }, // Traditional mediums
    "15": { values: [2], primary: false }, // Urban environments
    "16": { values: [3], primary: false }, // Problem-solving
    "17": { values: [1], primary: false }, // Spontaneous creation
    "18": { values: [4], primary: false }, // Minimalist aesthetics
    "19": { values: [5], primary: false }, // Typography
    "20": { values: [9, 10], primary: true }, // Historical art
    "21": { values: [2], primary: false }, // Quiet environment
    "22": { values: [3], primary: false }, // Collaborative projects
    "23": { values: [1], primary: false }, // Music influence
    "24": { values: [5], primary: false }, // Symmetry
    "25": { values: [4], primary: false }, // Unconventional materials
    "26": { values: [0], primary: false }, // Personal experiences
    "27": { values: [2], primary: false }, // Large scale
    "28": { values: [3], primary: false }, // Detailed work
    "29": { values: [1], primary: false }, // Monochromatic
    "30": { values: [4], primary: false }, // Social issues
    "31": { values: [2], primary: false }, // Limited palette
    "32": { values: [5], primary: false }, // Mixed media
    "33": { values: [4], primary: false }, // Cultural traditions
    "34": { values: [9, 10], primary: true }, // Commissioned projects
    "35": { values: [2], primary: false }, // Series or collections
    "36": { values: [9, 10], primary: true }, // Dreams and imagination
    "37": { values: [1], primary: false }, // Natural light
    "38": { values: [4], primary: false }, // Functional art
    "39": { values: [1], primary: false }, // Geometric patterns
    "40": { values: [2], primary: false }, // Literature inspiration
    "41": { values: [3], primary: false }, // Specific medium
    "42": { values: [1], primary: false }, // Experimental techniques
    "43": { values: [1], primary: false }, // Emotional states
    "44": { values: [4], primary: false }, // Small-scale projects
    "45": { values: [5], primary: false }, // Narrative works
    "46": { values: [9, 10], primary: true }, // Architectural forms
    "47": { values: [3], primary: false }, // Organic shapes
    "48": { values: [1], primary: false }, // Interactive art
    "49": { values: [2], primary: false }, // Texture
    "50": { values: [3], primary: false }, // Scientific concepts
  },
  "The Tortured Artist": {
    "1": { values: [2], primary: false }, // Structured environment
    "2": { values: [3], primary: false }, // Experimenting
    "3": { values: [1], primary: false }, // Nature inspiration
    "4": { values: [5], primary: false }, // Planning
    "5": { values: [4], primary: false }, // Multiple projects
    "6": { values: [2], primary: false }, // Working alone
    "7": { values: [3], primary: false }, // Bold colors
    "8": { values: [4], primary: false }, // Precision
    "9": { values: [1], primary: false }, // Breaking rules
    "10": { values: [2], primary: false }, // Abstract concepts
    "11": { values: [3], primary: false }, // Complete one project
    "12": { values: [1], primary: false }, // Current trends
    "13": { values: [4], primary: false }, // Digital tools
    "14": { values: [9, 10], primary: true }, // Traditional mediums
    "15": { values: [2], primary: false }, // Urban environments
    "16": { values: [3], primary: false }, // Problem-solving
    "17": { values: [9, 10], primary: true }, // Spontaneous creation
    "18": { values: [4], primary: false }, // Minimalist aesthetics
    "19": { values: [1], primary: false }, // Typography
    "20": { values: [2], primary: false }, // Historical art
    "21": { values: [3], primary: false }, // Quiet environment
    "22": { values: [9, 10], primary: true }, // Collaborative projects
    "23": { values: [1], primary: false }, // Music influence
    "24": { values: [5], primary: false }, // Symmetry
    "25": { values: [9, 10], primary: true }, // Unconventional materials
    "26": { values: [2], primary: false }, // Personal experiences
    "27": { values: [4], primary: false }, // Large scale
    "28": { values: [3], primary: false }, // Detailed work
    "29": { values: [1], primary: false }, // Monochromatic
    "30": { values: [4], primary: false }, // Social issues
    "31": { values: [2], primary: false }, // Limited palette
    "32": { values: [5], primary: false }, // Mixed media
    "33": { values: [4], primary: false }, // Cultural traditions
    "34": { values: [1], primary: false }, // Commissioned projects
    "35": { values: [2], primary: false }, // Series or collections
    "36": { values: [3], primary: false }, // Dreams and imagination
    "37": { values: [1], primary: false }, // Natural light
    "38": { values: [4], primary: false }, // Functional art
    "39": { values: [1], primary: false }, // Geometric patterns
    "40": { values: [2], primary: false }, // Literature inspiration
    "41": { values: [3], primary: false }, // Specific medium
    "42": { values: [1], primary: false }, // Experimental techniques
    "43": { values: [1], primary: false }, // Emotional states
    "44": { values: [4], primary: false }, // Small-scale projects
    "45": { values: [5], primary: false }, // Narrative works
    "46": { values: [9, 10], primary: true }, // Architectural forms
    "47": { values: [3], primary: false }, // Organic shapes
    "48": { values: [1], primary: false }, // Interactive art
    "49": { values: [2], primary: false }, // Texture
    "50": { values: [9, 10], primary: true }, // Scientific concepts
  },
  "The Solo Artist": {
    "1": { values: [2], primary: false }, // Structured environment
    "2": { values: [3], primary: false }, // Experimenting
    "3": { values: [1], primary: false }, // Nature inspiration
    "4": { values: [9, 10], primary: true }, // Planning
    "5": { values: [4], primary: false }, // Multiple projects
    "6": { values: [9, 10], primary: true }, // Working alone
    "7": { values: [3], primary: false }, // Bold colors
    "8": { values: [9, 10], primary: true }, // Precision
    "9": { values: [1], primary: false }, // Breaking rules
    "10": { values: [2], primary: false }, // Abstract concepts
    "11": { values: [9, 10], primary: true }, // Complete one project
    "12": { values: [4], primary: false }, // Current trends
    "13": { values: [1], primary: false }, // Digital tools
    "14": { values: [5], primary: false }, // Traditional mediums
    "15": { values: [2], primary: false }, // Urban environments
    "16": { values: [3], primary: false }, // Problem-solving
    "17": { values: [1], primary: false }, // Spontaneous creation
    "18": { values: [9, 10], primary: true }, // Minimalist aesthetics
    "19": { values: [4], primary: false }, // Typography
    "20": { values: [3], primary: false }, // Historical art
    "21": { values: [9, 10], primary: true }, // Quiet environment
    "22": { values: [0, 1], primary: true }, // Collaborative projects (special case - low value)
    "23": { values: [1], primary: false }, // Music influence
    "24": { values: [5], primary: false }, // Symmetry and balance
    "25": { values: [4], primary: false }, // Unconventional materials
    "26": { values: [2], primary: false }, // Personal experiences
    "27": { values: [4], primary: false }, // Large scale
    "28": { values: [9, 10], primary: true }, // Detailed work
    "29": { values: [1], primary: false }, // Monochromatic
    "30": { values: [4], primary: false }, // Social issues
    "31": { values: [2], primary: false }, // Limited palette
    "32": { values: [5], primary: false }, // Mixed media
    "33": { values: [4], primary: false }, // Cultural traditions
    "34": { values: [1], primary: false }, // Commissioned projects
    "35": { values: [9, 10], primary: true }, // Series or collections
    "36": { values: [3], primary: false }, // Dreams and imagination
    "37": { values: [1], primary: false }, // Natural light
    "38": { values: [9, 10], primary: true }, // Functional art
    "39": { values: [3], primary: false }, // Geometric patterns
    "40": { values: [2], primary: false }, // Literature inspiration
    "41": { values: [3], primary: false }, // Specific medium
    "42": { values: [1], primary: false }, // Experimental techniques
    "43": { values: [1], primary: false }, // Emotional states
    "44": { values: [9, 10], primary: true }, // Small-scale projects
    "45": { values: [5], primary: false }, // Narrative works
    "46": { values: [3], primary: false }, // Architectural forms
    "47": { values: [9, 10], primary: true }, // Organic shapes
    "48": { values: [1], primary: false }, // Interactive art
    "49": { values: [2], primary: false }, // Texture
    "50": { values: [3], primary: false }, // Scientific concepts
  },
};

// Special cases that override the default values
export const specialCases = {
  // Tech Artist and Dreamer Artist questions where low values are ideal
  lowValueQuestions: ["42", "43"],

  // Feeler Artist questions where low/mid-low values are ideal
  feelerLowQuestions: ["3", "12"],
};

// Override special cases
Object.entries(artistTypeIdealAnswers).forEach(([artistType, answers]) => {
  // Handle low value questions (42, 43)
  specialCases.lowValueQuestions.forEach((questionId) => {
    answers[questionId] = {
      values: [0, 1],
      primary: primaryQuestions[artistType as ArtistType].includes(questionId),
    };
  });

  // Handle Feeler Artist special cases (3, 12)
  if (artistType === "The Feeler Artist") {
    specialCases.feelerLowQuestions.forEach((questionId) => {
      answers[questionId] = {
        values: primaryQuestions[artistType].includes(questionId)
          ? [0, 1, 2, 3]
          : [7, 8],
        primary: primaryQuestions[artistType].includes(questionId),
      };
    });
  }
});

// Helper function to get ideal answer for a specific question and artist type
export function getIdealAnswer(
  artistType: ArtistType,
  questionId: string,
): IdealAnswerData | undefined {
  return artistTypeIdealAnswers[artistType]?.[questionId];
}
