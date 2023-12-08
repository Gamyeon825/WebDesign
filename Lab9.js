document.addEventListener("DOMContentLoaded", function () {
  // 获取Canvas元素
  const canvasContainer = document.getElementById("canvas-container");
  const canvas = document.createElement("canvas");
  canvasContainer.appendChild(canvas);

  // 获取WebGL上下文
  const gl = canvas.getContext("webgl");

  if (!gl) {
    console.error(
      "Unable to initialize WebGL. Your browser may not support it."
    );
    return;
  }

  // 顶点着色器代码
  const vsSource = `
        attribute vec4 aVertexPosition;
        uniform mat4 uModelViewMatrix;
        void main(void) {
            gl_Position = uModelViewMatrix * aVertexPosition;
        }
    `;

  // 片元着色器代码
  const fsSource = `
        precision mediump float;
        void main(void) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;

  // 编译着色器
  function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        "An error occurred compiling the shaders: " +
          gl.getShaderInfoLog(shader)
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  // 创建着色程序
  function createProgram(vsSource, fsSource) {
    const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(
        "Unable to initialize the shader program: " +
          gl.getProgramInfoLog(shaderProgram)
      );
      return null;
    }

    return shaderProgram;
  }

  // 创建着色程序
  const shaderProgram = createProgram(vsSource, fsSource);

  // 获取顶点位置属性
  const positionAttributeLocation = gl.getAttribLocation(
    shaderProgram,
    "aVertexPosition"
  );

  // 创建缓冲区
  const positionBuffer = gl.createBuffer();

  // 绑定缓冲区并设置顶点数据
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Float32Array([
    -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  // 设置视口大小
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // 使用着色程序
  gl.useProgram(shaderProgram);

  // 启用顶点属性并设置指针
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  // 设置模型视图矩阵
  const modelViewMatrix = mat4.create();
  const uModelViewMatrix = gl.getUniformLocation(
    shaderProgram,
    "uModelViewMatrix"
  );

  // 设置动画参数
  let rotationDirection = 1; // 1 for clockwise, -1 for counter-clockwise
  let isFilled = true;

  function drawScene() {
    // 更新模型视图矩阵
    mat4.rotate(
      modelViewMatrix,
      modelViewMatrix,
      0.01 * rotationDirection,
      [0, 0, 1]
    );
    mat4.scale(modelViewMatrix, modelViewMatrix, [
      isFilled ? 1 : 0.5,
      isFilled ? 1 : 0.5,
      1,
    ]);

    // 传递模型视图矩阵到着色器
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

    // 清除画布
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制三角形
    const primitiveType = isFilled ? gl.TRIANGLE_STRIP : gl.LINE_LOOP;
    gl.drawArrays(primitiveType, 0, positions.length / 2);

    requestAnimationFrame(drawScene);
  }

  // 启动动画
  setInterval(() => {
    rotationDirection *= -1; // 切换旋转方向
  }, 10000);

  setInterval(() => {
    isFilled = !isFilled; // 切换填充方式
  }, 20000);

  // 开始绘制场景
  drawScene();
});
