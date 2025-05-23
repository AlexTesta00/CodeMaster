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
   kotlin|kt)
      echo "Running Kotlin code..."
      kotlinc Main.kt -include-runtime -d main.jar
      if [ $? -ne 0 ]; then
        echo "Kotlin Compilation Failed"
        exit 1
      fi
      java -jar main.jar
      ;;
  *)
    echo "Unsupported language: $LANGUAGE"
    exit 2
    ;;
esac
