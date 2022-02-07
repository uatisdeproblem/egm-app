export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "egmapp": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        }
    },
    "api": {
        "egmapp": {
            "GraphQLAPIKeyOutput": "string",
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        }
    },
    "storage": {
        "s3egmappstorage": {
            "BucketName": "string",
            "Region": "string"
        }
    },
    "geo": {
        "egmVenuesMap": {
            "Name": "string",
            "Style": "string",
            "Region": "string",
            "Arn": "string"
        }
    }
}