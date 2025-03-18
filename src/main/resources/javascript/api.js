function execGraphQL(urlContext, query, variables, successCallback, errorCallback) {
    console.debug("Executing GraphQL...");

    async function fetchGraphQL(query, variables) {
        const response = await fetch(urlContext + '/modules/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    }

    // TODO use callbacks
    fetchGraphQL(query, variables)
        .then(data => {
            console.log(data);
            successCallback();
        })
        .catch(error => console.error('Error:', error));
}

/**
 *
 * @param httpResponse {Response}
 * @return {any} the JSON response
 */
function readResponse(httpResponse) {
    if (!httpResponse.ok) {
        throw new Error('Network response was not ok');
    }
    return httpResponse.json();
}

// TODO find  a better name
function readErrors(response) {
    console.debug("GraphQL JSON response: ", response);
    const errorMessage = response.errors?.map(e => e.message).join(', ');
    if (errorMessage) {
        throw new Error(errorMessage);
    }
    return response;
}

function execGraphQLPromise(urlContext, query, variables) {
    console.debug("Executing GraphQL...");
    return fetch(urlContext + '/modules/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    })
        .then(httpResponse => readResponse(httpResponse))
        .then(response => readErrors(response));
}

/**
 * Create a folder and return a Promise which resolves with the node uuid of the created folder.
 * @param context {string} the URL context
 * @param parentPathOrId {string} the parent folder, identified by its path or id, where to create the folder
 * @param folderName {string} the folder name to create
 * @return {Promise<string>} a Promise which resolves with the node uuid of the created folder
 */
function createFolder(context, parentPathOrId, folderName) {
    const query = `
                        mutation createFolder($parentPathOrId: String!, $folderName: String!) {
                          jcr(workspace: EDIT) {
                            addNode(
                              name: $folderName
                              parentPathOrId: $parentPathOrId
                              primaryNodeType: "jnt:folder"
                            ) {
                              uuid
                            }
                          }
                        }
                    `;
    const variables = {parentPathOrId: parentPathOrId, folderName: folderName};
    return execGraphQLPromise(context, query, variables)
        .then(response => {
            const newFolderId = response.data?.jcr?.addNode?.uuid;
            if (!newFolderId) {
                throw new Error("Unable to create the folder '" + folderName + "'")
            }
            return newFolderId;
        })
}

/**
 *
 * @param context {string} the URL context
 * @param folderId {string} the folder id where to upload the file
 * @param file {File} the file to upload
 * @returns {Promise<string>}
 */
function uploadFile(context, folderId, file) {
    const query = `
              mutation uploadFile($folderId: String!, $filename: String!, $file: String!, $mimeType: String!) {
                jcr(workspace: EDIT) {
                  addNode(name: $filename, parentPathOrId: $folderId, primaryNodeType: "jnt:file", mixins:["jmix:image"]) {
                    addChild(name: "jcr:content", primaryNodeType: "jnt:resource") {
                      content: mutateProperty(name: "jcr:data") { setValue(type: BINARY, value: $file)}
                      contentType: mutateProperty(name: "jcr:mimeType") { setValue(value: $mimeType)}
                    }
                    uuid
                  }
                }
              }
            `;

    const variables = {
        folderId: folderId,
        filename: file.name,
        file: "uploadedFile",
        mimeType: file.type
    };
    const payload = [{
        "operationName": "uploadFile",
        "variables": variables,
        "query": query
    }];

    const formData = new FormData()
    formData.append("query", JSON.stringify(payload));
    formData.append("uploadedFile", file);

    // TODO use callbacks
    // TODO handle case where file already exists
    return fetch(context + '/modules/graphql', {
        method: 'POST',
        body: formData
    })
        .then(httpResponse => readResponse(httpResponse))
        .then(response => {
            const fileUploadResult = Array.isArray(response) && response.length > 0 ? response[0] : null;
            if (!fileUploadResult) {
                throw new Error('Invalid API response');
            }
            return readErrors(fileUploadResult);
        })
        .then(response => {
            const fileId = response?.data?.jcr?.addNode?.uuid;
            if (!fileId) {
                throw new Error('Unable to  upload ' + file.name);
            }
            return fileId;
        });
}

/**
 * Delete a node.
 * @param nodePathOrId {string} the node identifier (path or id)
 * @returns {Promise<boolean>} a Promise which resolves with 'true'
 */
function deleteNode(nodePathOrId) {
    var query = `
    mutation deleteNode($nodePathOrId: String!) {
      jcr(workspace: EDIT) {
        deleteNode(pathOrId: $nodePathOrId)
      }
    }
    `
    const variables = {nodePathOrId: nodePathOrId};
    return execGraphQLPromise(context, query, variables)
        .then(response => {
            const success = response?.data?.jcr?.deleteNode;
            if (!success) {
                throw new Error('Unable to delete the node')
            }
            return true;
        });
}

/**
 * Update a node property.
 * @param nodeId {string} the node identifier
 * @param propertyName {string} the property name to update
 * @param value {string} to value to update the property with
 * @returns {Promise<boolean>} a Promise which resolves with 'true'
 */
function updateNodeProperty(nodeId, propertyName, value) {
    const query = `
        mutation updateNodeProperty($nodeId: String!, $propertyName:String!, $value: String!) {
          jcr(workspace: EDIT) {
            mutateNode(pathOrId: $nodeId) {
              mutateProperty(name: $propertyName) {
                setValue(value:$value)
              }
            }
          }
        }
    `;
    const variables = {nodeId: nodeId, propertyName: propertyName, value: value};
    return execGraphQLPromise(context, query, variables)
        .then(response => {
            const success = response?.data?.jcr?.mutateNode?.mutateProperty?.setValue;
            if (!success) {
                throw new Error('Unable to update the node property')
            }
            return true;
        });
}

/**
 * Delete a node property.
 * @param nodeId {string} the node identifier
 * @param propertyName {string} the property name to delete
 * @returns {Promise<boolean>} a Promise which resolves with 'true'
 */
function deleteNodeProperty(nodeId, propertyName) {
    const query = `
        mutation deleteNodeProperty($nodeId: String!, $propertyName: String!) {
          jcr(workspace: EDIT) {
            mutateNode(pathOrId: $nodeId) {
              mutateProperty(name: $propertyName) {
                delete
              }
            }
          }
        }
    `;
    const variables = {nodeId: nodeId, propertyName: propertyName};
    return execGraphQLPromise(context, query, variables)
        .then(response => {
            const success = response?.data?.jcr?.mutateNode?.mutateProperty?.delete;
            if (!success) {
                throw new Error('Unable to delete the node property')
            }
            return true;
        });
}

/**
 * Retrieve the UUID of a child node by its name under a given parent node.
 *
 * @param {string} parentNodeId - The UUID of the parent node.
 * @param {string} childName - The name of the child node to search for.
 * @returns {Promise<string>} A Promise that resolves with the UUID of the child node if found, or `undefined` otherwise.
 */
function getChildIdByPath(parentNodeId, childName) {
    const query = `
        query getNodeChildByPath($parentNodeId: String!, $childName: String!) {
          jcr(workspace: EDIT) {
            nodeById(uuid: $parentNodeId) {
              uuid
              children(names: [$childName]) {
                nodes {
                  uuid
                }
              }
            }
          }
        }
    `;
    const variables = {parentNodeId: parentNodeId, childName: childName};
    return execGraphQLPromise(context, query, variables)
        .then(response => {
            console.log('getChildIdByPath', response);
            const childId = response?.data?.jcr?.nodeById?.children?.nodes[0]?.uuid;
            // if (childId === null) {
            //     throw new Error('Unable to check if the node child exists')
            // }
            return childId;
        });
    // TODO return the uuid if found, or undefined otherwise
}