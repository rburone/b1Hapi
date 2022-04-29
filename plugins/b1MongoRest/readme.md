# API DEFINITION
## **Json configuration:**
```javascript
{
    'routes': [
        {
            'name': route name,
            'cmd': node driver command to run,
            'method': http method,
            'path': path definition (use :model where model name is required)
        },
        ...
    ],
    'model': {
        model_name: [
            {
                'name': route name,
                'permissions': [ACL permission 1, ACL permission 2]},
            ...
        ],
    }
}
```