#!/bin/bash
# Run once after granting the `project` scope:
#   gh auth refresh -h github.com -s project
#   bash scripts/create-project-board.sh

set -e

OWNER="r4kh4t"
REPO="antarctica-am-draft"

echo "Creating GitHub Project board..."

# Create project (Projects v2)
PROJECT_ID=$(gh api graphql -f query='
  mutation {
    createProjectV2(input: {
      ownerId: "'$(gh api user --jq '.node_id')'"
      title: "Antarctica AM — Portfolio Recommendation"
    }) {
      projectV2 { id number }
    }
  }' --jq '.data.createProjectV2.projectV2.id')

echo "Project ID: $PROJECT_ID"

# Add all 13 issues to the project
for N in 1 2 3 4 5 6 7 8 9 10 11 12 13; do
  ISSUE_ID=$(gh api repos/$OWNER/$REPO/issues/$N --jq '.node_id')
  gh api graphql -f query='
    mutation($proj: ID!, $item: ID!) {
      addProjectV2ItemById(input: { projectId: $proj contentId: $item }) {
        item { id }
      }
    }' -f proj="$PROJECT_ID" -f item="$ISSUE_ID" > /dev/null
  echo "  Added issue #$N"
done

echo ""
echo "✓ Board created. View it at:"
echo "  https://github.com/orgs/$OWNER/projects"
echo "  or https://github.com/users/$OWNER/projects"
