#!/bin/bash

LANGUAGE=$1

case "$LANGUAGE" in
  java)
    echo "Running Java code..."
    javac Main.java
    if [ $? -ne 0 ]; then
      echo "Java Compilation Failed"
      exit 1
    fi
    java Main
    ;;
  scala)
    echo "Running Scala code..."
    scala Main.scala
    ;;
  js|javascript|node)
    echo "Running JavaScript code..."
    node script.js
    ;;
  *)
    echo "Unsupported language: $LANGUAGE"
    exit 2
    ;;
esac
