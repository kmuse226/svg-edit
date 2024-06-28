document.addEventListener("DOMContentLoaded", function() {
    let selectedElement = null;

    // Interact.js 설정
    interact('svg line')
        .draggable({
            onmove: dragMoveListener
        });

    interact('.polyline-handle, .curve-handle')
        .draggable({
            onmove: handleDragMoveListener
        });

    interact('#line-handle1, #line-handle2')
        .draggable({
            onmove: handleDragMoveListener
        });

    // 드래그 이벤트 리스너
    function dragMoveListener(event) {
        let target = event.target;
        let x1 = (parseFloat(target.getAttribute('x1')) || 0) + event.dx;
        let y1 = (parseFloat(target.getAttribute('y1')) || 0) + event.dy;
        let x2 = (parseFloat(target.getAttribute('x2')) || 0) + event.dx;
        let y2 = (parseFloat(target.getAttribute('y2')) || 0) + event.dy;

        // Update the element's attributes
        target.setAttribute('x1', x1);
        target.setAttribute('y1', y1);
        target.setAttribute('x2', x2);
        target.setAttribute('y2', y2);

        updateHandles(target);
        updateForm(target);
    }

    function handleDragMoveListener(event) {
        let target = event.target;
        let svg = target.closest('svg');
        let element;

        if (target.classList.contains('polyline-handle')) {
            element = svg.querySelector('polyline');
            polylineHandleDragMove(event, element);
        } else if (target.classList.contains('curve-handle')) {
            element = svg.querySelector('path');
            curveHandleDragMove(event, element);
        } else if (target.id.startsWith('line-handle')) {
            element = svg.querySelector('line');
            lineHandleDragMove(event, element);
        }
    }

    function polylineHandleDragMove(event, polyline) {
        let target = event.target;
        let index = Array.from(target.parentElement.querySelectorAll('.polyline-handle')).indexOf(target);
        let x = (parseFloat(target.getAttribute('cx')) || 0) + event.dx;
        let y = (parseFloat(target.getAttribute('cy')) || 0) + event.dy;

        target.setAttribute('cx', x);
        target.setAttribute('cy', y);

        let points = polyline.getAttribute('points').split(' ').map(p => p.split(',').map(Number));
        points[index] = [x, y];
        polyline.setAttribute('points', points.map(p => p.join(',')).join(' '));

        updateForm(polyline);
    }

    function curveHandleDragMove(event, path) {
        let target = event.target;
        let handlers = Array.from(target.parentElement.querySelectorAll('.curve-handle'));
        let index = handlers.indexOf(target);
        let newX = (parseFloat(target.getAttribute('cx')) || 0) + event.dx;
        let newY = (parseFloat(target.getAttribute('cy')) || 0) + event.dy;
        console
    
        target.setAttribute('cx', newX);
        target.setAttribute('cy', newY);
    
    
        let d = path.getAttribute('d');
        console.log(d)
        let commands = d.match(/[A-Za-z][^A-Za-z]*/g); // 명령어와 좌표 분리
    
        commands = commands.map(command => {
            let [cmd, ...coords] = command.trim().split(/[\s,]+/);
            if (index === 0) {
                coords[0] = newX.toString();
                coords[1] = newY.toString();
            }
            if (cmd === 'C' && index <= coords.length / 2) {
                let coordIndex = index * 2;
                coords[coordIndex -2 ] = newX.toString();
                coords[coordIndex-1] = newY.toString();
            }
            return cmd + ' ' + coords.join(' ');
        });
    

        path.setAttribute('d', commands.join(' '));
        updateForm(path); // 추가 UI 업데이트나 데이터 처리
    }
    
    
    

    function lineHandleDragMove(event, line) {
        let target = event.target;
        let x = (parseFloat(target.getAttribute('cx')) || 0) + event.dx;
        let y = (parseFloat(target.getAttribute('cy')) || 0) + event.dy;

        target.setAttribute('cx', x);
        target.setAttribute('cy', y);

        if (target.id === 'line-handle1') {
            line.setAttribute('x1', x);
            line.setAttribute('y1', y);
        } else if (target.id === 'line-handle2') {
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
        }

        updateForm(line);
    }

    function updateHandles(element) {
        if (element.tagName === 'line') {
            let handle1 = element.parentElement.querySelector('#line-handle1');
            let handle2 = element.parentElement.querySelector('#line-handle2');

            handle1.setAttribute('cx', element.getAttribute('x1'));
            handle1.setAttribute('cy', element.getAttribute('y1'));
            handle2.setAttribute('cx', element.getAttribute('x2'));
            handle2.setAttribute('cy', element.getAttribute('y2'));
        } else if (element.tagName === 'polyline') {
            let points = element.getAttribute('points').split(' ').map(p => p.split(','));
            let handles = element.parentElement.querySelectorAll('.polyline-handle');
            handles.forEach((handle, index) => {
                handle.setAttribute('cx', points[index][0]);
                handle.setAttribute('cy', points[index][1]);
            });
        } else if (element.tagName === 'path') {
            let d = element.getAttribute('d').split(' ').map(c => {
                if (c.includes(',')) {
                    return c.split(',').map(Number);
                }
                return c;
            });

            let handles = element.parentElement.querySelectorAll('.curve-handle');
            handles.forEach((handle, index) => {
                handle.setAttribute('cx', d[index + 1][0]);
                handle.setAttribute('cy', d[index + 1][1]);
            });
        }
    }

    function updateForm(element) {
        document.getElementById('stroke').value = element.getAttribute('stroke') || '#000000';
        document.getElementById('strokeWidth').value = element.getAttribute('stroke-width') || 1;

        if (element.tagName === 'line') {
            document.getElementById('line-properties').style.display = 'block';
            document.getElementById('polyline-properties').style.display = 'none';
            document.getElementById('curve-properties').style.display = 'none';

            document.getElementById('x1').value = element.getAttribute('x1');
            document.getElementById('y1').value = element.getAttribute('y1');
            document.getElementById('x2').value = element.getAttribute('x2');
            document.getElementById('y2').value = element.getAttribute('y2');
        } else if (element.tagName === 'polyline') {
            document.getElementById('line-properties').style.display = 'none';
            document.getElementById('polyline-properties').style.display = 'block';
            document.getElementById('curve-properties').style.display = 'none';

            document.getElementById('points').value = element.getAttribute('points');
        } else if (element.tagName === 'path') {
            document.getElementById('line-properties').style.display = 'none';
            document.getElementById('polyline-properties').style.display = 'none';
            document.getElementById('curve-properties').style.display = 'block';

            document.getElementById('path').value = element.getAttribute('d');
        }
    }

    document.querySelectorAll('svg line, svg polyline, svg path').forEach(element => {
        element.addEventListener('click', function() {
            selectedElement = element;
            updateForm(selectedElement);
        });
    });

    document.getElementById('apply-btn').addEventListener('click', function() {
        if (selectedElement) {
            selectedElement.setAttribute('stroke', document.getElementById('stroke').value);
            selectedElement.setAttribute('stroke-width', document.getElementById('strokeWidth').value);

            if (selectedElement.tagName === 'line') {
                selectedElement.setAttribute('x1', document.getElementById('x1').value);
                selectedElement.setAttribute('y1', document.getElementById('y1').value);
                selectedElement.setAttribute('x2', document.getElementById('x2').value);
                selectedElement.setAttribute('y2', document.getElementById('y2').value);
            } else if (selectedElement.tagName === 'polyline') {
                selectedElement.setAttribute('points', document.getElementById('points').value);
            } else if (selectedElement.tagName === 'path') {
                selectedElement.setAttribute('d', document.getElementById('path').value);
            }

            updateHandles(selectedElement);
        }
    });

    document.getElementById('save-btn').addEventListener('click', function() {
        let svgData = [];
        document.querySelectorAll('.svg-container svg').forEach(svg => {
            svg.querySelectorAll('line, polyline, path').forEach(element => {
                let data = {
                    type: element.tagName,
                    attributes: {
                        stroke: element.getAttribute('stroke'),
                        strokeWidth: element.getAttribute('stroke-width')
                    }
                };

                if (element.tagName === 'line') {
                    data.attributes.x1 = element.getAttribute('x1');
                    data.attributes.y1 = element.getAttribute('y1');
                    data.attributes.x2 = element.getAttribute('x2');
                    data.attributes.y2 = element.getAttribute('y2');
                } else if (element.tagName === 'polyline') {
                    data.attributes.points = element.getAttribute('points');
                } else if (element.tagName === 'path') {
                    data.attributes.d = element.getAttribute('d');
                }

                svgData.push(data);
            });
        });
        console.log(JSON.stringify(svgData, null, 2));
    });

    document.getElementById('add-polyline-handle').addEventListener('click', function() {
        let polyline = document.getElementById('polyline-element');
        let points = polyline.getAttribute('points').split(' ').map(p => p.split(','));
        let lastPoint = points[points.length - 1];
        let newPoint = [parseFloat(lastPoint[0]) + 50, parseFloat(lastPoint[1])];
        points.push(newPoint);

        polyline.setAttribute('points', points.map(p => p.join(',')).join(' '));
        
        let newHandle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        newHandle.setAttribute('cx', newPoint[0]);
        newHandle.setAttribute('cy', newPoint[1]);
        newHandle.setAttribute('r', 5);
        newHandle.setAttribute('fill', 'red');
        newHandle.classList.add('polyline-handle');

        document.getElementById('polyline-svg').appendChild(newHandle);
        interact(newHandle).draggable({ onmove: handleDragMoveListener });
    });

    document.getElementById('add-curve-handle').addEventListener('click', function() {
        let path = document.getElementById('curve-element');
        let d = path.getAttribute('d').split(' ').map(c => {
            if (c.includes(',')) {
                return c.split(',').map(Number);
            }
            return c;
        });

        let lastControlPoint = d[d.length - 1];
        let newControlPoint = [parseFloat(lastControlPoint[0]) + 50, parseFloat(lastControlPoint[1])];

        d.push(newControlPoint.join(','));
        path.setAttribute('d', d.map(c => Array.isArray(c) ? c.join(',') : c).join(' '));

        let newHandle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        newHandle.setAttribute('cx', newControlPoint[0]);
        newHandle.setAttribute('cy', newControlPoint[1]);
        newHandle.setAttribute('r', 5);
        newHandle.setAttribute('fill', 'red');
        newHandle.classList.add('curve-handle');

        document.getElementById('curve-svg').appendChild(newHandle);
        interact(newHandle).draggable({ onmove: handleDragMoveListener });
    });
});
