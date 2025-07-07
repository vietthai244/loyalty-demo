# Design Document: Partner Dashboard - Program Management Module

## 1. Introduction

This document details the design and core functionalities of the **Program Management Module**, a key component within the Partner Dashboard of the Web3 Loyalties Project. This module provides loyalty partners with a powerful, intuitive, and visual interface to define, configure, and manage their custom loyalty programs.

Leveraging a node-based diagramming tool, partners can construct complex reward rules, constraints, and distribution logic as exemplified in the provided flow diagrams.

## 2. Module Objectives

The primary objectives of the Program Management Module are:

- **Empower Partners**: Provide partners with full control over the design and logic of their loyalty programs
- **Intuitive Configuration**: Offer a visual, drag-and-drop interface to simplify the creation of complex rule sets
- **Flexibility**: Support a wide range of program logic, including nested operators, diverse constraints, and multiple distribution types
- **Readability**: Allow partners to easily understand and review their program's flow at a glance
- **Program Lifecycle Management**: Enable partners to create, save, load, and potentially deploy/activate loyalty programs

## 3. Key Functionalities

This module encompasses the following core functionalities:

### 3.1. Program Lifecycle (CRUD Operations)

#### Create New Program
- Initiate a blank canvas for building a new loyalty program
- Prompt for a program name and description

#### Open/Load Existing Program
- Provide a list or selector to open previously saved loyalty programs
- *(Prototype scope: Load from local storage or mock data)*

#### Save Program
- Persist the current program's configuration (nodes, edges, properties) to storage
- *(Prototype scope: Save to local storage; eventual integration with backend API)*

#### Delete Program
- Remove a program from the stored list
- Confirmation dialog to prevent accidental deletion

### 3.2. Visual Program Editor (Canvas Interactions)

This is the central interactive area where partners build their programs.

#### Canvas Navigation
- **Zoom In/Out**: Mouse scroll or dedicated UI buttons to adjust canvas magnification
- **Pan**: Click-and-drag the canvas background to move the view

#### Node Management
- **Drag & Drop to Create**: Users drag pre-defined node types (Operators, Reward Rules, Constraints, Distributions) from a sidebar palette onto the canvas
- **Drag & Drop to Re-position**: Existing nodes on the canvas can be freely moved to rearrange the diagram's layout
- **Node Selection**: Clicking on a node selects it, highlighting it and displaying its properties in a dedicated panel
- **Node Deletion**: Selected nodes can be deleted (e.g., via a delete button in the properties panel or context menu)

#### Edge (Connection) Management
- **Create Connections**: Users can draw connections between compatible source and target node handles
- **Connection Validation**: Visual cues to indicate valid vs. invalid connection points
- **Delete Connections**: Selected edges can be deleted

### 3.3. Node Configuration (Property Panel)

A dynamic panel that appears when a node is selected, allowing partners to define the specific logic for that node. The content of this panel changes based on the selected node's type.

#### General Properties (for all nodes)
- **Node Label/Name**: A human-readable identifier for the node
- **Description (Optional)**: Detailed text field for notes

#### Operator Node Properties
- **Operator Type Selector**: Dropdown/radio buttons for SUM, MAX, SHARE, AND, OR

#### Reward Rule Node Properties
- No specific properties beyond general ones, as its logic is defined by linked Constraints

#### Constraint Node Properties
- **Parameter Field**: Dropdown of available data parameters (e.g., tx_type, value, location, time, actor)
- **Comparison Operator**: Dropdown for EQUAL, GREATER_OR_EQUAL, BETWEEN, IN, NOT EQUAL, etc.
- **Value Input**: Dynamic input field(s) based on parameter and operator type
- **Nested Constraint Logic**: If a Constraint node itself represents an AND/OR group, the property panel will allow adding/managing child constraints within it

#### Distribution Node Properties
- **Distribution Type**: Dropdown for do_to_distribution, do_campaign_distribution, do_event_distribution, do_behavior_distribution
- **Point Mapping Type**: Radio buttons to select Value Multiplier (value * X) or Fixed Ratio (RATIO=X)
- **Multiplier/Ratio Input**: Numeric input for the specific multiplier or ratio
- **Base Value Field**: Dropdown to select the source numerical field from the context of the flow

## 4. User Interface (UI) Components

The module will be composed of the following main UI areas:

### 4.1. Header/Toolbar
- **Program Actions**: Buttons for "New Program", "Open Program", "Save Program"
- **Program Name Display**: Shows the currently loaded program's name

### 4.2. Left Sidebar (Palette)
A dedicated section on the left containing draggable "blocks" or "stencils" representing the different node types.

Clearly labeled sections for:
- **Operators**: (SUM, MAX, SHARE, AND, OR)
- **Rule Types**: (Reward Rule)
- **Constraint Types**: (Generic Constraint)
- **Distribution Types**: (Generic Distribution)

Visual icons or mini-previews for each draggable element.

### 4.3. Main Canvas Area
- The central, largest area where the diagram is built
- Powered by React Flow
- Includes React Flow Controls (zoom in/out, fit view) and a background grid
- Custom React components rendered as nodes representing Operators, Reward Rules, Constraints, and Distributions

### 4.4. Right Sidebar (Property Panel)
- A dynamic panel on the right side of the screen
- Initially hidden or displaying generic "No Node Selected" message
- Populates with relevant input fields and controls when a node is selected on the canvas
- Includes "Apply Changes" / "Cancel" buttons or auto-saves on input blur

### 4.5. Modals / Dialogs
- **"Open Program" Modal**: A list of saved programs to select from
- **"Save Program As" Dialog**: For naming a new program or renaming an existing one
- **"Delete Confirmation" Dialog**: To confirm irreversible actions

## 5. Data Model (Conceptual for Frontend State)

The loyalty program structure will be represented as a collection of nodes and edges, which will be the primary state managed by React Flow.

```typescript
// Example Node Structure (simplified)
interface ProgramNode {
  id: string;
  type: 'operator' | 'rewardRule' | 'constraint' | 'distribution';
  position: { x: number; y: number; };
  data: {
    label: string; // Display label on the node
    // Type-specific properties
    operatorType?: 'SUM' | 'MAX' | 'SHARE' | 'AND' | 'OR'; // For 'operator' nodes
    parameter?: string; // For 'constraint' nodes (e.g., 'tx_type', 'value')
    comparisonOperator?: string; // For 'constraint' nodes (e.g., 'EQUAL', 'GREATER_OR_EQUAL')
    value?: string | number | string[]; // For 'constraint' nodes (e.g., '300k', ['HCM', 'HNI'])
    distributionType?: string; // For 'distribution' nodes
    pointMappingType?: 'VALUE_MULTIPLIER' | 'FIXED_RATIO'; // For 'distribution' nodes
    multiplier?: number; // For 'distribution' nodes
    baseValueField?: string; // For 'distribution' nodes (if VALUE_MULTIPLIER)
    // Additional generic properties
    description?: string;
  };
  // React Flow specific properties:
  sourcePosition?: 'top' | 'right' | 'bottom' | 'left';
  targetPosition?: 'top' | 'right' | 'bottom' | 'left';
  // ... other React Flow node properties
}

// Example Edge Structure (simplified)
interface ProgramEdge {
  id: string;
  source: string; // ID of the source node
  target: string; // ID of the target node
  sourceHandle?: string; // Optional: specific handle on source node
  targetHandle?: string; // Optional: specific handle on target node
  // ... other React Flow edge properties
}

// Full Program State
interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  nodes: ProgramNode[];
  edges: ProgramEdge[];
}
```

## 6. Technical Stack

- **Frontend Framework**: React.js
- **Diagramming Library**: @xyflow/react (React Flow)
- **State Management**: React's useState, useCallback, and useReducer for local component state
- **Styling**: Material-UI (MUI) for general dashboard UI elements, custom CSS modules for specific node styling within React Flow
- **Drag & Drop**: HTML5 Drag and Drop API, integrated with React Flow's screenToFlowPosition helper

## 7. Implementation Phases

### Phase 1: Basic Canvas Setup
- [x] Install and configure React Flow
- [x] Create basic canvas with sample nodes
- [ ] Implement basic node dragging and connection functionality

### Phase 2: Node Types and Properties
- [ ] Create custom node components for Operators, Rules, Constraints, and Distributions
- [ ] Implement property panel for node configuration
- [ ] Add validation for node connections

### Phase 3: Program Management
- [ ] Implement CRUD operations for programs
- [ ] Add save/load functionality with local storage
- [ ] Create program list and selection interface

### Phase 4: Advanced Features
- [ ] Add nested constraint logic support
- [ ] Implement program validation and error handling
- [ ] Add export/import functionality

## 8. Future Enhancements

- **Real-time Collaboration**: Multiple users editing the same program
- **Version Control**: Track changes and allow rollbacks
- **Program Templates**: Pre-built program templates for common use cases
- **Analytics Integration**: Real-time program performance metrics
- **API Integration**: Connect to backend services for program deployment