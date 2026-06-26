import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * The `admins` group gates the /admin interface. Membership is the authorization
 * boundary: signing in is not enough — a user must be in this group (checked
 * against the `cognito:groups` claim in app/admin/AdminGate.tsx).
 * Add a user to the group from the Cognito console or:
 *   aws cognito-idp admin-add-user-to-group \
 *     --user-pool-id <poolId> --username <email> --group-name admins
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ["admins"],
});
